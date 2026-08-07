import './DrawingTools.css';

const COLORS = [
  '#000000', '#ffffff', '#808080', '#c0c0c0',
  '#ff0000', '#800000', '#ff6600', '#804000',
  '#ffff00', '#808000', '#00ff00', '#008000',
  '#00ffff', '#008080', '#0000ff', '#000080',
  '#ff00ff', '#800080', '#ff69b4', '#8b4513',
];

const BRUSH_SIZES = [4, 8, 16, 28];

export default function DrawingTools({ color, setColor, brushSize, setBrushSize, tool, setTool, onClear, onUndo }) {
  return (
    <div className="drawing-tools">
      <div className="tools-section">
        <button
          className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
          onClick={() => setTool('brush')}
          title="Brush"
        >✏️</button>
        <button
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >🧹</button>
      </div>

      <div className="tools-divider" />

      <div className="tools-section colors-section">
        {COLORS.map(c => (
          <button
            key={c}
            className={`color-btn ${color === c ? 'selected' : ''}`}
            style={{ background: c }}
            onClick={() => { setColor(c); setTool('brush'); }}
            title={c}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={e => { setColor(e.target.value); setTool('brush'); }}
          className="color-custom"
          title="Custom color"
        />
      </div>

      <div className="tools-divider" />

      <div className="tools-section sizes-section">
        {BRUSH_SIZES.map(s => (
          <button
            key={s}
            className={`size-btn ${brushSize === s ? 'active' : ''}`}
            onClick={() => setBrushSize(s)}
            title={`Size ${s}`}
          >
            <span className="size-dot" style={{ width: Math.min(s, 24), height: Math.min(s, 24) }} />
          </button>
        ))}
      </div>

      <div className="tools-divider" />

      <div className="tools-section">
        <button className="tool-btn action-btn" onClick={onUndo} title="Undo (Ctrl+Z)">↩️</button>
        <button className="tool-btn action-btn danger" onClick={onClear} title="Clear canvas">🗑️</button>
      </div>
    </div>
  );
}
