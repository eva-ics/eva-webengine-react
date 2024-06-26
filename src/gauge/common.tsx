import { useCallback, useMemo } from "react";
import { calculateProgressColor } from "../common";

//Types

interface UseGaugeParams {
  diameter: number;
  startAngle: number;
  endAngle: number;
  numTicks: number;
  domain: [number, number];
}

interface GetNeedleParams {
  value: number;
  baseRadius: number;
  tipRadius: number;
  offset?: number;
}

interface GetArcPropsParams {
  offset?: number;
  startAngle: number;
  endAngle: number;
}

interface GetTickPropsParams {
  length: number;
  angle: number;
}

interface GetLabelPropsParams {
  angle: number;
  offset: number;
}

//Libs
const degreesToRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

const makeTickMarks = (
  minAngle: number,
  maxAngle: number,
  numTicks: number
) => {
  const tickMarks = [];
  const angleRange = maxAngle - minAngle;
  const angleStep = angleRange / (numTicks - 1);
  for (let i = 0; i < numTicks; i++) {
    tickMarks.push(Math.floor(minAngle + i * angleStep));
  }
  return tickMarks.reverse();
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = degreesToRadians(angleInDegrees);

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

//Hooks
export const useGauge = (params: UseGaugeParams) => {
  const { startAngle, endAngle, numTicks, diameter, domain } = params;
  const radius = diameter / 2;
  const [minValue, maxValue] = domain;

  const ticks = useMemo(() => {
    return makeTickMarks(startAngle, endAngle, numTicks).reverse();
  }, [startAngle, endAngle, numTicks]);

  const getLabelProps = useCallback(
    (params: GetLabelPropsParams) => {
      const { angle, offset } = params;
      const p1 = polarToCartesian(0, 0, radius - offset, angle + 90);

      return {
        x: p1.x,
        y: p1.y,
        dominantBaseline: "middle",
        textAnchor: "middle"
      };
    },
    [diameter, radius]
  );

  const getTickProps = useCallback(
    (params: GetTickPropsParams) => {
      const { length, angle } = params;
      const p1 = polarToCartesian(0, 0, radius, angle + 90);
      const p2 = polarToCartesian(0, 0, radius + length, angle + 90);

      return {
        x1: p1.x,
        x2: p2.x,
        y1: p1.y,
        y2: p2.y
      };
    },
    [ticks, diameter, radius]
  );

  const angleToValue = (angle: number) => {
    const angleRange = endAngle - startAngle;
    const valueRange = maxValue - minValue;
    const value = minValue + ((angle - startAngle) / angleRange) * valueRange;
    return Math.round(value);
  };

  const valueToAngle = (value: number) => {
    const angleRange = endAngle - startAngle;
    const valueRange = maxValue - minValue;
    const angle = startAngle + ((value - minValue) / valueRange) * angleRange;
    return Math.round(angle);
  };

  const getArcProps = useCallback(
    (params: GetArcPropsParams) => {
      const { offset = 0, startAngle, endAngle, ...rest } = params;

      let start = polarToCartesian(0, 0, radius + offset, startAngle + 90);
      let end = polarToCartesian(0, 0, radius + offset, endAngle + 90);

      let largeArcFlag = endAngle - startAngle < 180 ? "0" : "1";

      let d = [
        "M",
        start.x - 0.001,
        start.y,
        "A",
        radius + offset,
        radius + offset,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y
      ].join(" ");

      return {
        d,
        ...rest
      };
    },
    [diameter, radius]
  );

  const getNeedleProps = useCallback(
    (params: GetNeedleParams) => {
      const { value, baseRadius, tipRadius, offset = 0 } = params;
      const angle = valueToAngle(value);

      const baseCircleCenter = {
        x: 0,
        y: 0
      };

      const tipCircleCenter = polarToCartesian(
        0,
        0,
        radius - offset,
        angle + 90
      );

      if (isNaN(tipCircleCenter.x)) {
        tipCircleCenter.x = 0;
      }

      if (isNaN(tipCircleCenter.y)) {
        tipCircleCenter.y = 0;
      }

      const vals = {
        base: {
          r: baseRadius,
          cx: baseCircleCenter.x,
          cy: baseCircleCenter.y
        },
        tip: {
          r: tipRadius,
          cx: tipCircleCenter.x,
          cy: tipCircleCenter.y
        },
        points: [
          [
            baseCircleCenter.x + baseRadius * Math.cos(degreesToRadians(angle)),
            baseCircleCenter.y + baseRadius * Math.sin(degreesToRadians(angle))
          ],
          [
            tipCircleCenter.x + tipRadius * Math.cos(degreesToRadians(angle)),
            tipCircleCenter.y + tipRadius * Math.sin(degreesToRadians(angle))
          ],
          [
            tipCircleCenter.x +
              tipRadius * Math.cos(degreesToRadians(angle - 180)),
            tipCircleCenter.y +
              tipRadius * Math.sin(degreesToRadians(angle - 180))
          ],
          [
            baseCircleCenter.x +
              baseRadius * Math.cos(degreesToRadians(angle - 180)),
            baseCircleCenter.y +
              baseRadius * Math.sin(degreesToRadians(angle - 180))
          ]
        ]
          .map(([x, y]) => {
            if (!isNaN(x) || !isNaN(y)) {
              return `${x},${y}`;
            }
          })
          .join(" ")
      };
      return vals;
    },
    [valueToAngle, diameter, radius]
  );

  const calculatediameterForDirection = useCallback(
    (startAngle: number, deg: number) => {
      const angle = startAngle - deg;
      const distance = (Math.cos(degreesToRadians(angle)) * diameter) / 2;
      return distance;
    },
    [diameter]
  );

  const getSVGProps = () => {
    const getDistanceForDirection = (deg: number) => {
      if (startAngle < deg && endAngle > deg) return diameter / 2;
      const startAngleDistance = calculatediameterForDirection(
        startAngle + 90,
        deg + 90
      );
      const endAngleDistance = calculatediameterForDirection(
        endAngle + 90,
        deg + 90
      );
      return Math.max(0, startAngleDistance, endAngleDistance);
    };

    const [top, right, bottom, left] = [
      getDistanceForDirection(180),
      getDistanceForDirection(270),
      getDistanceForDirection(0),
      getDistanceForDirection(90)
    ];

    const width = left + right;
    const height = top + bottom;

    const viewBox = [-left, -top, width, height].join(" ");

    return {
      width,
      height,
      viewBox
    };
  };

  return {
    ticks,
    getTickProps,
    getLabelProps,
    valueToAngle,
    angleToValue,
    getArcProps,
    getNeedleProps,
    getSVGProps
  };
};

export const calculateColor = (
  value?: number,
  warnValue?: number,
  critValue?: number,
  lowWarnValue?: number,
  lowCritValue?: number
) => {
  return calculateProgressColor(
    "gauge",
    value,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue
  );
};
