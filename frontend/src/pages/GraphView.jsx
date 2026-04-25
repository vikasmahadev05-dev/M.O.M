import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Maximize2, 
    ZoomIn, 
    ZoomOut, 
    RefreshCw, 
    Layers, 
    MousePointer2, 
    Grip, 
    Sparkles, 
    Trash2,
    Info
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { updateNotePosition, clearAllGraphPins } from '../store/notesSlice';

const GraphView = () => {
    const dispatch = useDispatch();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [hoverNode, setHoverNode] = useState(null);
    const { user } = useSelector(state => state.auth);

    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const navigate = useNavigate();
    const graphRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Map CSS classes to Hex for D3 rendering
    const getColorHex = (colorClass) => {
        const mapping = {
            'bg-[var(--pastel-blue)]': '#eef2ff',
            'bg-[var(--pastel-indigo)]': '#e0e7ff',
            'bg-[var(--pastel-lavender)]': '#f5f3ff',
            'bg-[var(--pastel-mint)]': '#f0fdf4',
            'bg-[var(--pastel-peach)]': '#fff7ed',
            'bg-[var(--pastel-rose)]': '#fff1f2',
            'bg-white': '#ffffff'
        };
        // Handle case where colorClass might be just the variable name or a custom class
        if (mapping[colorClass]) return mapping[colorClass];
        if (colorClass?.includes('indigo')) return '#e0e7ff';
        if (colorClass?.includes('rose')) return '#fff1f2';
        return '#ffffff';
    };

    const fetchGraph = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notes/graph/data`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setGraphData({
                nodes: res.data.nodes.map(n => ({ 
                    ...n, 
                    name: n.title,
                    val: 1, // Base weight
                    colorHex: getColorHex(n.color),
                    // RESORE SAVED POSITIONS (fx/fy are special D3 props for pinned nodes)
                    fx: n.fx,
                    fy: n.fy
                })),
                links: res.data.edges
            });
        } catch (err) {
            console.error('Graph fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);


    useEffect(() => {
        fetchGraph();
    }, [fetchGraph]);

    const handleNodeClick = (node) => {
        navigate(`/notes/${node.id}`);
    };

    const handleNodeDragEnd = (node) => {
        node.fx = node.x;
        node.fy = node.y;
        // PERSIST TO BACKEND
        dispatch(updateNotePosition({ id: node.id, fx: node.x, fy: node.y }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#fcfcfd] rounded-[3rem]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={20} />
                </div>
                <p className="mt-6 text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">Mapping Neural Net...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-white relative">
            {/* Background Texture */}
            <div className="absolute inset-0 paper-texture pointer-events-none opacity-20" />

            {/* Force Graph */}
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={windowSize.width}
                height={windowSize.height}
                nodeLabel="name"
                onNodeClick={handleNodeClick}
                onNodeDragEnd={handleNodeDragEnd}
                onNodeHover={setHoverNode}
                
                // Absolute Zero Drift Physics
                d3VelocityDecay={1}
                d3AlphaDecay={1}
                cooldownTicks={0}

                // Aesthetic Mapping - RETURNING TO MINIMALIST SILK
                linkColor={() => '#e2e8f0'} 
                linkWidth={link => hoverNode === link.source || hoverNode === link.target ? 3 : 1.5}
                linkLineDash={[5, 3]} 
                linkDirectionalParticles={1} 
                linkDirectionalParticleSpeed={0.003}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleColor={() => '#818cf8'} 

                nodeCanvasObject={(node, ctx, globalScale) => {
                    // Guard: Ensure node has valid coordinates
                    if (!isFinite(node.x) || !isFinite(node.y)) return;

                    const label = node.name;
                    const fontSize = 11 / globalScale;
                    const isHovered = hoverNode === node;
                    
                    // 1. Shadow/Glow
                    ctx.shadowColor = isHovered ? 'rgba(99, 102, 241, 0.4)' : 'rgba(0,0,0,0.05)';
                    ctx.shadowBlur = isHovered ? 20 : 10;
                    ctx.shadowOffsetY = 4 / globalScale;

                    // 2. Node Bubble (Pastel)
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.colorHex || '#ffffff';
                    ctx.fill();

                    // 3. Border (Matching tone)
                    ctx.strokeStyle = isHovered ? '#6366f1' : '#f1f5f9';
                    ctx.lineWidth = isHovered ? 2 / globalScale : 1 / globalScale;
                    ctx.stroke();

                    // 4. Text Label
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px "Outfit"`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isHovered ? '#1e293b' : '#64748b'; 
                    ctx.fillText(label, node.x, node.y + (12 / globalScale));
                    
                    // 5. Pin Indicator
                    if (node.fx !== undefined) {
                        ctx.beginPath();
                        ctx.arc(node.x + 4, node.y - 4, 1.5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = '#6366f1';
                        ctx.fill();
                    }
                }}
                backgroundColor="#ffffff"
            />
        </div>
    );
};

export default GraphView;


