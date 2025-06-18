import { useRef, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = [
  "#0EA5E9", // Primary Blue
  "#F97316", // Orange
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#EF4444", // Red
  "#6366F1", // Lighter Indigo
];

const DonutChart = ({ data, totalCount,chartKey }) => {
  if (!data) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }
  const chartRef = useRef(null);
  const isMobile = useIsMobile();
  const [chartHeight, setChartHeight] = useState("300px");
  const [internalKey, setInternalKey] = useState(0);
  
  const calculatedTotal = totalCount || (data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0);

  useEffect(() => {
    
    setInternalKey(prev => prev + 1);
  }, [data, totalCount, chartKey]);
  useEffect(() => {
    const handleResize = () => {
      setChartHeight("300px");
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white rounded-lg p-1">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  const options = {
    tooltip: {
      trigger: "item",
      formatter: ({ name, value }) => {
        const percentage = calculatedTotal > 0 
          ? ((value / calculatedTotal) * 100).toFixed(1) 
          : 0;
        return `
          <div style="font-weight: bold">${name}</div>
          <div>Nombre: ${value}</div>
          <div>(${percentage}%)</div>
        `;
      },
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#000000e6",
        fontSize: 13,
      },
      extraCssText: "box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border-radius: 6px;",
    },
    legend: {
      orient: "vertical",
      left: isMobile ? "center" : "right",
      top: isMobile ? "bottom" : "middle",
      itemWidth: 12,
      itemHeight: 12,
      icon: "circle",
      textStyle: {
        fontSize: 13,
        color: "#000000e6",
        fontWeight: 500,
      },
      formatter: (name) => {
        const item = data.find((d) => d.metier === name);
        if (item && calculatedTotal > 0) {
          const percentage = ((item.count / calculatedTotal) * 100).toFixed(1);
          return `${name}: ${percentage}%`;
        }
        return name;
      },
      itemGap: 12,
      pageIconColor: "#4F46E5",
      pageTextStyle: {
        color: "#000000e6",
      },
    },
    color: COLORS,
    series: [
      {
        name: "Métier",
        type: "pie",
        radius: ["40%", "70%"],
        center: isMobile ? ["50%", "40%"] : ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fff",
          borderWidth: 2,
          shadowBlur: 5,
          shadowColor: "rgba(0, 0, 0, 0.1)",
        },
        label: {
          show: true,
          position: "center",
          formatter: () => {
            if (calculatedTotal === 0) return '0%';
            const totalPercentage = data.reduce((sum, item) => {
              return sum + ((item.count / calculatedTotal) * 100);
            }, 0);
            return `{a|${totalPercentage.toFixed(1)}%}`;
          },
          rich: {
            a: {
              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",
              align: "center",
            },
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          value: item.count,
          name: item.metier,
          itemStyle: {
            color: COLORS[index % COLORS.length],
          },
        })),
        animationType: "expansion",
        animationEasing: "cubicOut",
        animationDuration: 1000,
      },
    ],
  };

  return (
    <div className="w-full h-[300px] bg-white rounded-lg p-1">
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: chartHeight, width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
        className="shadow-sm"
      />
    </div>
  );
};

export default DonutChart;