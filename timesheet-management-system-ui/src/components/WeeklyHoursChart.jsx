import React, { useEffect, useRef } from 'react';
import { parseISO, format, startOfWeek, addDays } from 'date-fns';

function WeeklyHoursChart({ timesheets }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !timesheets || timesheets.length === 0) return;

    // This is a placeholder for a real chart library
    // In a real implementation, you would use a library like Chart.js or Recharts
    const ctx = chartRef.current.getContext('2d');
    
    // Clear previous chart
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    // Get current week's timesheet if exists
    const currentDate = new Date();
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    // Generate weekdays
    const weekdays = Array.from({ length: 7 }, (_, i) => ({
      date: addDays(currentWeekStart, i),
      label: format(addDays(currentWeekStart, i), 'EEE')
    }));
    
    // Extract hours per day from timesheet entries
    const hoursPerDay = weekdays.map(day => {
      let totalHours = 0;
      
      timesheets.forEach(timesheet => {
        timesheet.entries.forEach(entry => {
          const entryDate = parseISO(entry.date);
          if (format(entryDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')) {
            totalHours += entry.actualHours;
          }
        });
      });
      
      return { ...day, hours: totalHours };
    });
    
    // Chart dimensions
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    const bottomPadding = 40;
    const leftPadding = 40;
    const rightPadding = 20;
    const topPadding = 30;
    
    const chartWidth = width - leftPadding - rightPadding;
    const chartHeight = height - bottomPadding - topPadding;
    
    // Calculate max value for scaling
    const maxHours = Math.max(...hoursPerDay.map(day => day.hours), 8) * 1.2;
    
    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(leftPadding, height - bottomPadding);
    ctx.lineTo(width - rightPadding, height - bottomPadding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(leftPadding, topPadding);
    ctx.lineTo(leftPadding, height - bottomPadding);
    ctx.stroke();
    
    // Draw bars
    const barWidth = (chartWidth / 7) - 10;
    
    hoursPerDay.forEach((day, index) => {
      const x = leftPadding + index * (chartWidth / 7) + 5;
      const barHeight = (day.hours / maxHours) * chartHeight;
      const y = height - bottomPadding - barHeight;
      
      // Draw bar
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw day label
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, x + barWidth / 2, height - bottomPadding + 15);
      
      // Draw hours value
      if (day.hours > 0) {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${day.hours}h`, x + barWidth / 2, y - 10);
      }
    });
    
    // Draw Y-axis labels (hours)
    const yAxisSteps = 4;
    for (let i = 0; i <= yAxisSteps; i++) {
      const value = (maxHours / yAxisSteps) * i;
      const y = height - bottomPadding - (i / yAxisSteps) * chartHeight;
      
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(value)}h`, leftPadding - 5, y + 3);
      
      // Draw grid line
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(leftPadding, y);
      ctx.lineTo(width - rightPadding, y);
      ctx.stroke();
    }
    
    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Hours Logged This Week', width / 2, 20);
  }, [timesheets]);

  return (
    <div className="flex items-center justify-center h-full">
      <canvas ref={chartRef} width="400" height="200"></canvas>
    </div>
  );
}

export default WeeklyHoursChart;