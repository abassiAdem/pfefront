import React from 'react';

/**
 * @param {Object} props
 * @param {number} props.fromX - Coordonnée X du point de départ
 * @param {number} props.fromY - Coordonnée Y du point de départ
 * @param {number} props.toX - Coordonnée X du point d'arrivée
 * @param {number} props.toY - Coordonnée Y du point d'arrivée
 */
const DependencyArrow = ({ fromX, fromY, toX, toY }) => {
  // Calculate the control points for a curved line
  const midX = (fromX + toX) / 2;
  
  // Create an SVG path for a curved arrow
  const path = `
    M ${fromX} ${fromY}
    C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}
  `;

  // Create arrow head coordinates
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const arrowSize = 8;
  const arrowX1 = toX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowY1 = toY - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowX2 = toX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowY2 = toY - arrowSize * Math.sin(angle + Math.PI / 6);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
      </defs>
      <path
        d={path}
        stroke="#888"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};

export default DependencyArrow;