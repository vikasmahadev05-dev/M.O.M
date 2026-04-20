/**
 * Extracts plain text from TipTap JSON content or HTML/Plain string.
 */
export const extractPlainText = (content) => {
  if (!content) return '';
  
  // If it's already a plain string that doesn't look like JSON
  if (typeof content === 'string' && !content.trim().startsWith('{') && !content.trim().startsWith('[')) {
    return content.replace(/<[^>]*>/g, '').trim();
  }

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Recursive function to extract text from TipTap nodes
    const getNodesText = (node) => {
      if (node.type === 'text') return node.text;
      if (node.content) return node.content.map(getNodesText).join(' ');
      return '';
    };

    if (parsed.type === 'doc' && parsed.content) {
      return parsed.content.map(getNodesText).join(' ').trim();
    }
    
    return String(content).replace(/<[^>]*>/g, '').trim();
  } catch (e) {
    // Fallback for non-JSON strings that might contain HTML
    return String(content).replace(/<[^>]*>/g, '').trim();
  }
};
