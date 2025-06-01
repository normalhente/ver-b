'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    p5: any;
  }
}

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const sketch = (p: any) => {
      let particles: any[] = [];
      const numParticles = 100;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current);
        p.background(0);
        
        // 파티클 초기화
        for (let i = 0; i < numParticles; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-2, 2),
            vy: p.random(-2, 2),
            size: p.random(2, 6),
            color: p.color(p.random(255), p.random(255), p.random(255))
          });
        }
      };

      p.draw = () => {
        p.background(0, 20);
        
        // 파티클 업데이트 및 그리기
        particles.forEach(particle => {
          // 위치 업데이트
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // 경계 체크
          if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
          
          // 파티클 그리기
          p.noStroke();
          p.fill(particle.color);
          p.circle(particle.x, particle.y, particle.size);
          
          // 파티클 간 선 연결
          particles.forEach(other => {
            const d = p.dist(particle.x, particle.y, other.x, other.y);
            if (d < 100) {
              p.stroke(particle.color);
              p.strokeWeight(0.5);
              p.line(particle.x, particle.y, other.x, other.y);
            }
          });
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.mouseMoved = () => {
        // 마우스 근처의 파티클에 영향
        particles.forEach(particle => {
          const d = p.dist(p.mouseX, p.mouseY, particle.x, particle.y);
          if (d < 100) {
            const angle = p.atan2(p.mouseY - particle.y, p.mouseX - particle.x);
            particle.vx += p.cos(angle) * 0.2;
            particle.vy += p.sin(angle) * 0.2;
          }
        });
      };
    };

    // p5 인스턴스 생성
    const p5Instance = new window.p5(sketch);

    // 클린업
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen bg-black"
    />
  );
}
