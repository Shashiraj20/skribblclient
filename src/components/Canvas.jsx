import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 600;

const Canvas = forwardRef(function Canvas({ isDrawer, color, brushSize, tool, onDrawStart, onDrawMove, onDrawEnd }, ref) {
  const canvasRef = useRef(null);
  const isPointerDown = useRef(false);
  const lastPos = useRef(null);
  const currentSettings = useRef(null);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * scaleX) / CANVAS_W,
      y: ((clientY - rect.top) * scaleY) / CANVAS_H,
    };
  };

  const drawSegment = useCallback((ctx, fromX, fromY, toX, toY, strokeColor, size, eraserMode) => {
    ctx.globalCompositeOperation = eraserMode ? 'destination-out' : 'source-over';
    ctx.strokeStyle = eraserMode ? 'rgba(0,0,0,1)' : strokeColor;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX * CANVAS_W, fromY * CANVAS_H);
    ctx.lineTo(toX * CANVAS_W, toY * CANVAS_H);
    ctx.stroke();
  }, []);

  const redrawFromStrokes = useCallback((strokes) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    strokes.forEach(stroke => {
      if (!stroke.points || stroke.points.length < 2) return;
      const isEraser = stroke.tool === 'eraser';
      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        drawSegment(ctx, p1.x, p1.y, p2.x, p2.y, stroke.color, stroke.size, isEraser);
      }
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [drawSegment]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const applyRemoteStroke = useCallback((data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (data.type === 'start') {
      currentSettings.current = { color: data.color, size: data.size, tool: data.tool };
      lastPos.current = { x: data.x, y: data.y };
    } else if (data.type === 'move' && currentSettings.current && lastPos.current) {
      const { color: c, size: s, tool: t } = currentSettings.current;
      drawSegment(ctx, lastPos.current.x, lastPos.current.y, data.x, data.y, c, s, t === 'eraser');
      ctx.globalCompositeOperation = 'source-over';
      lastPos.current = { x: data.x, y: data.y };
    } else if (data.type === 'end') {
      currentSettings.current = null;
      lastPos.current = null;
    } else if (data.type === 'clear') {
      clearCanvas();
    } else if (data.type === 'undo') {
      redrawFromStrokes(data.strokes || []);
    }
  }, [drawSegment, clearCanvas, redrawFromStrokes]);

  useImperativeHandle(ref, () => ({
    applyRemoteStroke,
    clearCanvas,
    redrawFromStrokes,
  }), [applyRemoteStroke, clearCanvas, redrawFromStrokes]);

  const handlePointerDown = useCallback((e) => {
    if (!isDrawer) return;
    e.preventDefault();
    isPointerDown.current = true;
    const pos = getPos(e);
    lastPos.current = pos;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    onDrawStart({ x: pos.x, y: pos.y, color, size: brushSize, tool });
  }, [isDrawer, color, brushSize, tool, onDrawStart]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawer || !isPointerDown.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const last = lastPos.current;

    drawSegment(ctx, last.x, last.y, pos.x, pos.y, color, brushSize, tool === 'eraser');
    ctx.globalCompositeOperation = 'source-over';

    lastPos.current = pos;
    onDrawMove({ x: pos.x, y: pos.y });
  }, [isDrawer, color, brushSize, tool, drawSegment, onDrawMove]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawer || !isPointerDown.current) return;
    isPointerDown.current = false;
    lastPos.current = null;
    onDrawEnd();
  }, [isDrawer, onDrawEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="game-canvas"
      style={{ cursor: isDrawer ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default' }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
});

export default Canvas;
