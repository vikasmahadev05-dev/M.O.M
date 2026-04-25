import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const KnowledgeGraphPage = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const graphRef = useRef();

    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchGraph = async () => {
            if (!user?.token) return;
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notes/graph/data`,
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );

                // react-force-graph expects 'source' and 'target' which the API provides
                setGraphData({
                    nodes: res.data.nodes.map(n => ({ ...n, name: n.title })),
                    links: res.data.edges
                });
            } catch (err) {
                console.error('Graph fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGraph();
    }, []);

    const handleNodeClick = (node) => {
        navigate(`/notes/${node.id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mapping your neurons...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#fcfcfd] overflow-hidden relative">
            {/* Header Overlay */}
            <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
                <button 
                    onClick={() => navigate('/notes')}
                    className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 hover:text-indigo-600 transition-all hover:shadow-md"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl shadow-sm">
                    <h1 className="text-sm font-black text-slate-800 tracking-tight">Knowledge Graph</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">M.O.M Brain Visualization</p>
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
                <button onClick={() => graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400)} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-all">
                    <ZoomIn size={18} />
                </button>
                <button onClick={() => graphRef.current.zoom(graphRef.current.zoom() * 0.8, 400)} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-all">
                    <ZoomOut size={18} />
                </button>
                <button onClick={() => graphRef.current.centerAt(0, 0, 400)} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition-all">
                    <Maximize2 size={18} />
                </button>
                <div className="h-4" />
                <button onClick={() => window.location.reload()} className="p-3 bg-indigo-500 border border-indigo-600 rounded-xl shadow-lg text-white hover:bg-indigo-600 transition-all">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 paper-texture pointer-events-none opacity-40" />

            {/* Force Graph */}
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => '#6366f1'} // Indigo
                nodeRelSize={8}
                linkColor={() => '#e2e8f0'} // Slate-200
                linkWidth={1.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px "Outfit"`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

                    // Node Circle (Pastel)
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#6366f1';
                    ctx.fill();
                    
                    // Glow
                    ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
                    ctx.shadowBlur = 10;

                    // Label
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1e293b'; // Slate-800
                    ctx.fillText(label, node.x, node.y + 10);
                }}
                onNodeClick={handleNodeClick}
                backgroundColor="rgba(252, 252, 253, 0)"
                cooldownTicks={100}
                onEngineStop={() => graphRef.current.zoomToFit(400, 100)}
            />
        </div>
    );
};

export default KnowledgeGraphPage;
