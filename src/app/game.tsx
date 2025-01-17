"use client";

import React, { useRef, useState, useEffect } from "react";
import { gameFailure, gameSuccess } from "./actions/actions";

export type Shape = "triangle" | "star" | "kite";

export default function gamePage({shape} : {shape: Shape}) {
    const [info, setInfo] = useState("Once you click on the shape, you have a few seconds to trace it in one press to join the Discord!");
    const [isPlaying, setIsPlaying] = useState(false);
    const [failed, setFailed] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [visitedPoints, setVisitedPoints] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(15);
    const [distanceTolerance, setDistanceTolerance] = useState(7.5);

    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const shapes: Record<Shape, string> = {
        star: "200,30 240,140 360,140 260,200 300,320 200,260 100,320 140,200 40,140 160,140",
        triangle: "200,20 380,380 20,380",
        kite: "200,20 350,120 200,380 50,120",
    };

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (timeLeft === 0) {
            setFailed(true);
            setIsPlaying(false);
            setInfo("Time's up! Game Over!");
        }
    }, [isPlaying, timeLeft]);

    const normalizeEvent = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const { left, top } = svgContainerRef.current!.getBoundingClientRect();
        if ("touches" in e) {
            setDistanceTolerance(10);
            const touch = e.touches[0];
            if (!touch) return { x: 0, y: 0 };
            return { x: touch.clientX - left, y: touch.clientY - top };
        } else {
            return { x: e.clientX - left, y: e.clientY - top };
        }
    };

    const handleStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (isPlaying) return;
        const { x, y } = normalizeEvent(e);
        setStartPoint({ x, y });
        setVisitedPoints(new Set());
        setInfo("Tracing the shape... stay close to the edges!");
        setFailed(false);
        setIsPlaying(true);
        setTimeLeft(15);
        clearTrail();
    };

    const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isPlaying || failed) return;
        const { x, y } = normalizeEvent(e);
        const points = getShapePoints();
        if (getNearestDistance(points, x, y) > distanceTolerance) {
            setFailed(true);
            setIsPlaying(false);
            setInfo("You went too far! Game Over!");
            gameFailure();
            return;
        }
        setVisitedPoints((prev) => new Set(prev).add(getNearestPointIndex(points, x, y)));
        drawTrail(x, y);
    };

    const handleEnd = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isPlaying || failed || !startPoint) return;
        const { x, y } = normalizeEvent(e);
        const points = getShapePoints();
        if (
            visitedPoints.size === points.length &&
            Math.hypot(x - startPoint.x, y - startPoint.y) <= distanceTolerance + 5
        ) {
            setInfo("Congratulations! You have automatically been added to the Discord!");
            gameSuccess();
        } else {
            setInfo("You didn't return to your starting point or missed points. Try again tomorrow...");
            gameFailure();
        }
        setIsPlaying(false);
    };

    const getShapePoints = (): [number, number][] =>
        svgRef.current
            ?.querySelector("polygon")
            ?.getAttribute("points")
            ?.split(" ")
            .map((point) => point.split(",").map(Number) as [number, number]) || [];

    const getNearestDistance = (points: [number, number][], x: number, y: number) =>
        Math.min(...points.map(([px, py], i) => {
            const [nx, ny] = points[(i + 1) % points.length] || [px, py];
            return pointToSegmentDistance(x, y, px, py, nx, ny);
        }));
    const getNearestPointIndex = (points: [number, number][], x: number, y: number) =>
        points.reduce((nearest, [px, py], i) =>
            points[nearest] && Math.hypot(x - px, y - py) < Math.hypot(x - points[nearest][0], y - points[nearest][1]) ? i : nearest, 0);
    const pointToSegmentDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
        const dx = x2 - x1, dy = y2 - y1, lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared)) : 0;
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    };

    const drawTrail = (x: number, y: number) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", "2");
        circle.setAttribute("fill", "blue");
        svgRef.current?.appendChild(circle);
    };

    const clearTrail = () => svgRef.current?.querySelectorAll("circle").forEach((circle) => circle.remove());

    return (
        <>
            <div
                className="relative w-[400px] h-[400px] mx-auto my-4 bg-gray-200 border border-gray-400"
                ref={svgContainerRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 400"
                >
                    <polygon
                        points={shapes[shape]}
                        fill="gold"
                        stroke="black"
                        strokeWidth="2"
                    />
                </svg>
            </div>
            <div className="text-center mt-2">{info}</div>
            {isPlaying && (
                <div className="text-center mt-2">
                    Time left: {timeLeft} seconds
                </div>
            )}
        </>
    );
};
