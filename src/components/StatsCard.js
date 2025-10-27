import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'purple', change }) => {
  const colorClasses = {
    blue: 'bg-purple-600',
    green: 'bg-purple-600',
    purple: 'bg-purple-600',
    orange: 'bg-gold-500',
    red: 'bg-red-500',
    gold: 'bg-gold-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${change > 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} rounded-full p-4`}>
          {Icon && <Icon className="w-8 h-8 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
