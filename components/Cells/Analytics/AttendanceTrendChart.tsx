import { CellSession } from "@/services/CellAttendance/cellAttendance.type";
import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

type Props = {
  sessions: CellSession[];
};

const CHART_HEIGHT = 160;
const CHART_PADDING_X = 8;
const CHART_PADDING_Y = 12;

const toPercentOfTotal = (count: number, totalMembers: number) => {
  if (!totalMembers) return 0;
  return Math.round((count / totalMembers) * 100);
};

const shortDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("default", { month: "short", day: "numeric" });
};

export default function AttendanceTrendChart({ sessions }: Props) {
  const [chartWidth, setChartWidth] = useState(0);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(a.meeting_date).getTime() -
          new Date(b.meeting_date).getTime(),
      ),
    [sessions],
  );

  const points = useMemo(
    () =>
      sortedSessions.map((session) =>
        toPercentOfTotal(
          Number(session.member_count ?? 0),
          Number(session.total_members ?? 0),
        ),
      ),
    [sortedSessions],
  );

  const labelIndexes = useMemo(() => {
    if (sortedSessions.length <= 6) {
      return sortedSessions.map((_, index) => index);
    }
    const step = (sortedSessions.length - 1) / 5;
    return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
  }, [sortedSessions]);

  const onChartLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className="bg-white border border-gray-200 rounded-xl p-4 gap-3">
      <View>
        <Text className="text-sm font-semibold text-gray-900">
          Session Trend
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          Member attendance as % of total members
        </Text>
      </View>

      {sessions.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-sm text-gray-400">
            No session data to chart yet
          </Text>
        </View>
      ) : (
        <View>
          <View className="flex-row" style={{ height: CHART_HEIGHT }}>
            <View className="justify-between pr-2 w-8">
              {[100, 75, 50, 25, 0].map((tick) => (
                <Text
                  key={tick}
                  className="text-[10px] text-gray-400 text-right"
                >
                  {tick}%
                </Text>
              ))}
            </View>

            <View className="flex-1" onLayout={onChartLayout}>
              {chartWidth > 0 && (
                <Svg width={chartWidth} height={CHART_HEIGHT}>
                  {[0, 25, 50, 75, 100].map((tick) => {
                    const y =
                      CHART_PADDING_Y +
                      ((100 - tick) / 100) *
                        (CHART_HEIGHT - CHART_PADDING_Y * 2);
                    return (
                      <Line
                        key={tick}
                        x1={0}
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke={
                          tick === 50
                            ? "rgb(156 163 175)"
                            : "rgb(243 244 246)"
                        }
                        strokeWidth={tick === 50 ? 1.5 : 1}
                        strokeDasharray={tick === 50 ? "6 4" : undefined}
                      />
                    );
                  })}

                  <TrendLine
                    points={points}
                    width={chartWidth}
                    height={CHART_HEIGHT}
                  />
                </Svg>
              )}
            </View>
          </View>

          <View className="flex-row justify-between mt-2 pl-8">
            {labelIndexes.map((index) => (
              <Text key={index} className="text-[10px] text-gray-400">
                {shortDate(sortedSessions[index]?.meeting_date)}
              </Text>
            ))}
          </View>

          <View className="flex-row items-center justify-center gap-2 mt-3">
            <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <Text className="text-xs text-gray-600">Members</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function TrendLine({
  points,
  width,
  height,
}: {
  points: number[];
  width: number;
  height: number;
}) {
  const usableWidth = width - CHART_PADDING_X * 2;
  const usableHeight = height - CHART_PADDING_Y * 2;

  const coords = points.map((value, index) => {
    const x =
      points.length === 1
        ? width / 2
        : CHART_PADDING_X + (index / (points.length - 1)) * usableWidth;
    const y = CHART_PADDING_Y + ((100 - value) / 100) * usableHeight;
    return { x, y };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <>
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke="rgb(37 99 235)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map((c, index) => (
        <Circle
          key={index}
          cx={c.x}
          cy={c.y}
          r={3.5}
          fill="rgb(37 99 235)"
          stroke="#fff"
          strokeWidth={2}
        />
      ))}
    </>
  );
}
