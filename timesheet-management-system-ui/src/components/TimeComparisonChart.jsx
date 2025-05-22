import React, { useEffect, useRef } from 'react';

function TimeComparisonChart({ planned, actual }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // This is a placeholder for a real chart library
    // In a real implementation, you would use a library like Chart.js or Recharts
    const ctx = chartRef.current.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    // Chart dimensions
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    const barHeight = 40;
    const maxBarWidth = width - 140;
    const startX = 120;
    const startY = height / 2 - barHeight - 10;
    
    // Calculate max value for scaling
    const maxValue = Math.max(planned, actual) * 1.2;
    
    // Draw bars
    // Planned hours
    const plannedWidth = (planned / maxValue) * maxBarWidth;
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(startX, startY, plannedWidth, barHeight);
    
    // Actual hours
    const actualWidth = (actual / maxValue) * maxBarWidth;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(startX, startY + barHeight + 20, actualWidth, barHeight);
    
    // Draw labels
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Planned:', startX - 10, startY + barHeight / 2 + 5);
    ctx.fillText('Actual:', startX - 10, startY + barHeight + 20 + barHeight / 2 + 5);
    
    // Draw values
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${planned} hrs`, startX + 10, startY + barHeight / 2 + 5);
    ctx.fillText(`${actual} hrs`, startX + 10, startY + barHeight + 20 + barHeight / 2 + 5);
    
    // Draw legend
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(width - 100, height - 50, 15, 15);
    ctx.fillStyle = '#10B981';
    ctx.fillRect(width - 100, height - 25, 15, 15);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Planned', width - 80, height - 38);
    ctx.fillText('Actual', width - 80, height - 13);
    
    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Planned vs Actual Hours', width / 2, 20);
    
    // Draw percentage
    const percentage = planned > 0 ? Math.round((actual / planned) * 100) : 0;
    ctx.fillStyle = percentage > 100 ? '#EF4444' : '#10B981';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${percentage}% Utilization`, width / 2, height - 30);
  }, [planned, actual]);

  return (
    <div className="flex items-center justify-center h-full">
      <canvas ref={chartRef} width="400" height="200"></canvas>
    </div>
  );
}

export default TimeComparisonChart;