const ChartHeader = ({ title, subtitle }) => {
    return (
      <div className="space-y-1 pb-2">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
      </div>
    );
  };

  export default ChartHeader;