"use client";

// Ported verbatim from New-ASR-Client/src/components/TimePicker.jsx.

import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";

export default function TimePicker({ onSelectTime, initialTime }) {
  const [activeView, setActiveView] = useState("hours");
  const [selectedHour, setSelectedHour] = useState(() => {
    if (initialTime) {
      const [hours] = initialTime.split(":");
      return parseInt(hours, 10);
    }
    return 12;
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (initialTime) {
      const [, minutes] = initialTime.split(":");
      return parseInt(minutes, 10);
    }
    return 0;
  });
  const [period, setPeriod] = useState(() => {
    if (initialTime) {
      const [, period] = initialTime.split(" ");
      return period || "PM";
    }
    return "PM";
  });

  const clockFaceRef = useRef(null);
  const viewTransitionRef = useRef(null);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);

  const formatTime = useCallback(() => {
    const hour12 =
      selectedHour > 12
        ? selectedHour - 12
        : selectedHour === 0
        ? 12
        : selectedHour;
    const formattedHour = hour12.toString().padStart(2, "0");
    const formattedMinute = selectedMinute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${period}`;
  }, [selectedHour, selectedMinute, period]);

  useEffect(() => {
    if (onSelectTime && hasUserInteraction && isSelectionComplete) {
      onSelectTime(formatTime(), isSelectionComplete);
      setIsSelectionComplete(false);
    }
  }, [
    selectedHour,
    selectedMinute,
    period,
    formatTime,
    onSelectTime,
    hasUserInteraction,
    isSelectionComplete,
  ]);
  const togglePeriod = (e) => {
    e.stopPropagation();
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
    setHasUserInteraction(true);
  };

  const handleViewTransition = (newView, e) => {
    if (e) e.stopPropagation();

    if (viewTransitionRef.current) {
      viewTransitionRef.current.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        setActiveView(newView);
        viewTransitionRef.current.classList.remove("scale-95", "opacity-0");
      }, 150);
    } else {
      setActiveView(newView);
    }
  };

  // Generate hours for the clock face (12-hour format)
  const renderHours = () => {
    const hours = [];
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30 - 90; // 30 degrees per hour, starting from -90 (12 o'clock)
      const radians = angle * (Math.PI / 180);
      const radius = 70; // Distance from center
      const x = radius * Math.cos(radians);
      const y = radius * Math.sin(radians);

      const displayHour = i;
      const actualHour =
        selectedHour === 0
          ? 12
          : selectedHour > 12
          ? selectedHour - 12
          : selectedHour;
      const isSelected = i === actualHour;

      hours.push(
        <div
          key={i}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full
            ${
              isSelected
                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-200/50"
                : "hover:bg-yellow-50 hover:shadow-sm"
            } 
            cursor-pointer transition-all duration-300 z-10`}
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            const newHour =
              period === "PM" ? (i === 12 ? 12 : i + 12) : i === 12 ? 0 : i;
            setSelectedHour(newHour);
            setHasUserInteraction(true);
            handleViewTransition("minutes", e);
          }}
        >
          <span
            className={`${
              isSelected ? "text-white" : "text-gray-700"
            } font-medium`}
          >
            {displayHour}
          </span>
        </div>
      );
    }
    return hours;
  };

  // Generate minutes for the clock face (in increments of 5)
  const renderMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 12; i++) {
      const minute = i * 5;
      const angle = i * 30 - 90; // 30 degrees per 5 minutes, starting from -90 (0 minutes)
      const radians = angle * (Math.PI / 180);
      const radius = 70; // Distance from center
      const x = radius * Math.cos(radians);
      const y = radius * Math.sin(radians);

      const isSelected = selectedMinute === minute;

      minutes.push(
        <div
          key={i}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full
            ${
              isSelected
                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-200/50"
                : "hover:bg-yellow-50 hover:shadow-sm"
            } 
            cursor-pointer transition-all duration-300 z-10`}
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation();

            setSelectedMinute(minute);
            setHasUserInteraction(true);
            setIsSelectionComplete(true);
          }}
        >
          <span
            className={`${
              isSelected ? "text-white" : "text-gray-700"
            } font-medium`}
          >
            {minute.toString().padStart(2, "0")}
          </span>
        </div>
      );
    }
    return minutes;
  };

  // Calculate the angle for clock hand with proper offset
  const calculateHandAngle = () => {
    if (activeView === "hours") {
      const hour = selectedHour % 12;
      const angle = (hour || 12) * 30 - 90; // -90 degree offset for 12 o'clock position
      return angle;
    } else {
      const angle = selectedMinute * 6 - 90; // -90 degree offset for 12 o'clock position
      return angle;
    }
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const handleDone = (e) => {
    e.stopPropagation();
    setIsSelectionComplete(true);
  };

  return (
    <div
      className="relative z-[100] bg-white rounded-xl shadow-xl p-5 border border-gray-100 w-72 transition-all duration-300 backdrop-blur-sm"
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-6 px-2">
        <button
          className={`text-xl font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
            activeView === "hours"
              ? "bg-yellow-100 text-yellow-700 shadow-sm"
              : "text-gray-500 hover:bg-yellow-50"
          }`}
          onClick={(e) => handleViewTransition("hours", e)}
        >
          {(selectedHour === 0
            ? 12
            : selectedHour > 12
            ? selectedHour - 12
            : selectedHour
          )
            .toString()
            .padStart(2, "0")}
        </button>
        <span className="text-gray-500 text-xl font-light animate-pulse">
          :
        </span>
        <button
          className={`text-xl font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
            activeView === "minutes"
              ? "bg-yellow-100 text-yellow-700 shadow-sm"
              : "text-gray-500 hover:bg-yellow-50"
          }`}
          onClick={(e) => handleViewTransition("minutes", e)}
        >
          {selectedMinute.toString().padStart(2, "0")}
        </button>

        <div
          className="ml-3 relative bg-gray-200 rounded-full h-8 w-16 flex items-center p-1 cursor-pointer"
          onClick={togglePeriod}
        >
          <div
            className={`absolute w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 transform ${
              period === "PM" ? "translate-x-7" : "translate-x-0"
            }`}
          ></div>
          <span
            className={`w-1/2 text-xs font-medium text-center transition-colors z-10 ${
              period === "AM" ? "text-yellow-600" : "text-gray-400"
            }`}
          >
            AM
          </span>
          <span
            className={`w-1/2 text-xs font-medium text-center transition-colors z-10 ${
              period === "PM" ? "text-yellow-600" : "text-gray-400"
            }`}
          >
            PM
          </span>
        </div>
      </div>
      <div
        ref={clockFaceRef}
        className="relative h-56 w-56 mx-auto mb-5 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 shadow-inner overflow-hidden"
      >
        {/* Clock face accents */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-yellow-50/30 rounded-full"></div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm z-20"></div>

        <div className="absolute left-1/2 top-1/2 z-10">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-[2px] w-[65px] rounded-full shadow-md origin-left"
            style={{
              transform: `rotate(${calculateHandAngle()}deg)`,
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        <div
          ref={viewTransitionRef}
          className="absolute inset-0 transform transition-all duration-150"
        >
          {activeView === "hours" ? renderHours() : renderMinutes()}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-col items-center mb-3">
          <div className="text-gray-400 text-xs mb-1">SELECTED TIME</div>
          <div className="text-lg font-semibold text-gray-800 animate-appear">
            {formatTime()}
          </div>
        </div>
        <button
          onClick={handleDone}
          className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
          transition-colors duration-200 font-medium text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}

TimePicker.propTypes = {
  onSelectTime: PropTypes.func,
  initialTime: PropTypes.string,
};
