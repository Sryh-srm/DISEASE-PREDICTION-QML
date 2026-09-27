import React, { useRef, useEffect } from 'react';
import '../styles/cosmic-tunnel.css';

export default function CosmicTunnelBackground({ isLoaded }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Particle system
    const particles = [];
    const numParticles = 1500;
    const maxZ = 2000;
    const tunnelRadius = 300;
    const speed = 4;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        z: Math.random() * maxZ,
        radiusOffset: (Math.random() - 0.5) * 50,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#00f0ff' : '#0077ff' // Cyan to deep blue
      });
    }

    let time = 0;

    const render = () => {
      ctx.fillStyle = `rgba(5, 6, 8, ${isLoaded ? 0.4 : 0.8})`; // Fade out trail based on load state
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      time += 0.01;

      // Draw path (yellowish path at the bottom like the image)
      ctx.beginPath();
      for (let z = 0; z < maxZ; z += 50) {
        const perspective = 300 / (z + 1);
        const pathX = centerX + Math.sin(z * 0.005 + time) * 100 * perspective;
        const pathY = centerY + 150 * perspective;
        
        if (z === 0) ctx.moveTo(pathX, pathY);
        else ctx.lineTo(pathX, pathY);
      }
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)'; // Amber path
      ctx.lineWidth = 100;
      ctx.stroke();

      // Draw particles
      particles.forEach(p => {
        p.z -= speed;
        if (p.z <= 0) {
          p.z = maxZ;
          p.angle = Math.random() * Math.PI * 2;
        }

        // Add some swirl based on time and z
        const currentAngle = p.angle + time * 0.5 + p.z * 0.001;
        const currentRadius = tunnelRadius + p.radiusOffset + Math.sin(time + p.z * 0.01) * 50;

        const perspective = 300 / p.z;
        
        // 3D to 2D projection
        const x = centerX + Math.cos(currentAngle) * currentRadius * perspective;
        const y = centerY + Math.sin(currentAngle) * currentRadius * perspective;

        const size = Math.max(0.1, p.size * perspective);
        
        // Opacity fades out in distance
        const opacity = Math.min(1, Math.max(0, 1 - (p.z / maxZ)));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * (isLoaded ? 0.3 : 1); // Dim particles when loaded
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1; // reset

      // Draw bright light at end of tunnel
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${isLoaded ? 0.1 : 0.8})`);
      gradient.addColorStop(0.2, `rgba(0, 240, 255, ${isLoaded ? 0.05 : 0.4})`);
      gradient.addColorStop(1, 'rgba(5, 6, 8, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isLoaded]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`cosmic-tunnel ${isLoaded ? 'loaded' : ''}`}
    />
  );
}
