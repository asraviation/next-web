"use client";

// Featured Deals manager.
//
// Ported from New-ASR-Client/src/pages/LegDealsAdmin.jsx. Authentication is
// NOT handled here — app/admin/layout.tsx gates every route under /admin, so
// this component can assume an authorized admin and focus on the CRUD.

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AirportAutosuggest from "@/components/AirportAutosuggest";
import Pagination from "@/components/Pagination";
import TimePicker from "@/components/TimePicker";
import Calendar from "@/components/Calender";
import type { Deal } from "@/lib/deals";

const DateIcon = "/admin/calendar.png";
const WhereIcon = "/admin/planeoff.png";
const ToIcon = "/admin/planeon.png";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FIELD_CLASS = `w-full h-12 pl-12 pr-4 bg-gray-50 rounded-lg border-2 border-transparent
  focus:border-[rgba(246,226,150,1)] focus:ring-0 focus:outline-none focus:bg-white
  transition-all duration-200 hover:bg-gray-100`;

const DEALS_PAGE_SIZE = 10;

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

export default function FeaturedDealsAdmin() {
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [planeValue, setPlaneValue] = useState("");
  const [seaterValue, setSeaterValue] = useState("");
  const [perSeatValue, setPerSeatValue] = useState("");
  const [wholeJetValue, setWholeJetValue] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editingDeal, setEditingDeal] = useState<number | null>(null);
  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [page, setPage] = useState(1);

  const formRef = useRef<HTMLFormElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchDeals = useCallback(async () => {
    try {
      const response = await fetch("/api/deals", { cache: "no-store" });
      const data = await response.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  }, []);

  /** POST to edit, PUT to add — same verbs the ASR backend used. */
  const sendDealToBackend = async (dealData: any, isEditing = false) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await fetch("/api/deals", {
        method: isEditing ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // httpOnly session cookie
        body: JSON.stringify(dealData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || `Server responded with ${response.status}`);
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

      return result;
    } catch (error: any) {
      console.error("Error submitting deal:", error);
      setSubmitError(error.message || "Failed to submit deal");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromValue || !toValue) {
      setSubmitError("Origin and destination are required");
      return;
    }

    const newDeal = {
      from: fromValue.trim(),
      to: toValue.trim(),
      plane: planeValue,
      date: dateValue,
      time: timeValue,
      seater: parseInt(seaterValue) || 0,
      perSeat: parseFloat(perSeatValue) || 0,
      wholeJet: parseFloat(wholeJetValue) || 0,
      booked: isBooked,
      image: imagePreview,
    };

    let result;

    if (editingDeal !== null) {
      const dealToUpdate = deals[editingDeal];
      // Send only the fields that actually changed.
      const updatedFields = Object.keys(newDeal).reduce((acc, key) => {
        const next = (newDeal as any)[key];
        if (next !== (dealToUpdate as any)[key]) acc[key] = next;
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(updatedFields).length === 0) {
        setEditingDeal(null);
        resetForm();
        return;
      }

      result = await sendDealToBackend(
        { id: dealToUpdate._id ?? dealToUpdate.id, ...updatedFields },
        true
      );
      if (result) setEditingDeal(null);
    } else {
      result = await sendDealToBackend(newDeal, false);
    }

    if (!result) return;

    // Re-read from the server so derived status and ids stay authoritative.
    await fetchDeals();
    resetForm();

    gsap.fromTo(
      formPanelRef.current,
      { borderColor: "rgba(52, 211, 153, 1)" },
      { borderColor: "rgba(229, 231, 235, 1)", duration: 1.5 }
    );
  };

  const resetForm = () => {
    setFromValue("");
    setToValue("");
    setPlaneValue("");
    setDateValue("");
    setTimeValue("");
    setSeaterValue("");
    setPerSeatValue("");
    setWholeJetValue("");
    setIsBooked(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (index: number) => {
    const dealToEdit = deals[index];
    setFromValue(dealToEdit.from ?? "");
    setToValue(dealToEdit.to ?? "");
    setPlaneValue(dealToEdit.plane ?? "");
    setDateValue(dealToEdit.date ?? "");
    setTimeValue(dealToEdit.time ?? "");
    setSeaterValue(String(dealToEdit.seater ?? ""));
    setPerSeatValue(String(dealToEdit.perSeat ?? ""));
    setWholeJetValue(String(dealToEdit.wholeJet ?? ""));
    setIsBooked(Boolean(dealToEdit.booked));
    setImagePreview(dealToEdit.image ?? null);
    setEditingDeal(index);

    formRef.current?.scrollIntoView({ behavior: "smooth" });
    gsap.fromTo(
      formPanelRef.current,
      { backgroundColor: "rgba(219, 234, 254, 0.7)" },
      { backgroundColor: "rgba(255, 255, 255, 1)", duration: 1.5 }
    );
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;

    const dealToDelete = deals[index];
    try {
      const response = await fetch("/api/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // httpOnly session cookie
        body: JSON.stringify({ id: dealToDelete._id ?? dealToDelete.id }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || response.statusText);
      }

      await fetchDeals();

      if (editingDeal === index) {
        resetForm();
        setEditingDeal(null);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("Failed to delete the deal. Please try again.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDateSelection = (year: number, month: number, day: number) => {
    setDateValue(`${MONTHS[month]} ${day}, ${year}`);
    setShowCalendar(false);

    const dateInput = document.querySelector('input[name="date"]');
    gsap.fromTo(
      dateInput,
      { backgroundColor: "rgba(236, 252, 203, 0.8)" },
      { backgroundColor: "rgba(249, 250, 251, 1)", duration: 1, ease: "power2.out" }
    );
  };

  const handleTimeSelection = (time: string, completed: boolean) => {
    if (!completed) return;

    setTimeValue(time);
    setShowTimePicker(false);

    const timeInput = document.querySelector('input[name="time"]');
    gsap.fromTo(
      timeInput,
      { backgroundColor: "rgba(236, 252, 203, 0.8)" },
      { backgroundColor: "rgba(249, 250, 251, 1)", duration: 1, ease: "power2.out" }
    );
  };

  const toggleCalendar = () => {
    if (showTimePicker) setShowTimePicker(false);

    if (!showCalendar) {
      setShowCalendar(true);
    } else {
      gsap.to(calendarRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.2,
        onComplete: () => setShowCalendar(false),
      });
    }
  };

  const toggleTimePicker = () => {
    if (showCalendar) setShowCalendar(false);

    if (!showTimePicker) {
      setShowTimePicker(true);
    } else {
      gsap.to(timePickerRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.2,
        onComplete: () => setShowTimePicker(false),
      });
    }
  };

  // Entrance animations + click-outside handling
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formPanelRef.current) {
        gsap.from(formPanelRef.current, {
          y: -20, opacity: 0, duration: 0.8, ease: "power3.out",
        });
      }
      if (tableRef.current) {
        gsap.from(tableRef.current, {
          y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2,
        });
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(target)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      gsap.fromTo(
        calendarRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [showCalendar]);

  useEffect(() => {
    if (showTimePicker && timePickerRef.current) {
      gsap.fromTo(
        timePickerRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [showTimePicker]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Featured Deals</h1>
      <p className="text-gray-500 mb-8">
        These deals appear in the Featured Deals section of the public site.
      </p>

      {/* Form Section */}
      <div
        ref={formPanelRef}
        className="bg-white rounded-xl shadow-lg p-6 mb-10 border-2 border-gray-200"
      >
        <h2 className="text-xl font-semibold mb-6 text-blue-800">
          {editingDeal !== null ? "Edit Leg Deal" : "Add New Leg Deal"}
        </h2>

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">Deal submitted successfully!</span>
          </div>
        )}

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">Error: {submitError}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From and To Fields */}
            <div className="relative">
              <AirportAutosuggest
                placeholder="Origin"
                iconSrc={WhereIcon}
                inputClassName={FIELD_CLASS}
                apiUrl="/airports.json"
                value={fromValue}
                onChange={setFromValue}
                inputRef={fromInputRef}
              />
            </div>

            <div className="relative">
              <AirportAutosuggest
                placeholder="Destination"
                iconSrc={ToIcon}
                inputClassName={FIELD_CLASS}
                apiUrl="/airports.json"
                value={toValue}
                onChange={setToValue}
                inputRef={toInputRef}
              />
            </div>

            {/* Aircraft Type */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <input
                type="text"
                name="plane"
                placeholder="Aircraft Type"
                className={FIELD_CLASS}
                value={planeValue}
                onChange={(e) => setPlaneValue(e.target.value)}
                required
              />
            </div>

            {/* Date Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <img src={DateIcon} alt="Date" className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="date"
                placeholder="Select date"
                className={`${FIELD_CLASS} cursor-pointer`}
                value={dateValue}
                onClick={toggleCalendar}
                readOnly
                required
              />
              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute top-full left-0 z-50 mt-1"
                  style={{ width: "280px" }}
                >
                  <Calendar onSelectDate={handleDateSelection} />
                </div>
              )}
            </div>

            {/* Time Field with TimePicker */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="time"
                placeholder="Select time"
                className={`${FIELD_CLASS} cursor-pointer`}
                value={timeValue}
                onClick={toggleTimePicker}
                readOnly
                required
              />
              {showTimePicker && (
                <div ref={timePickerRef} className="absolute top-full left-0 z-50 mt-1">
                  <TimePicker onSelectTime={handleTimeSelection} initialTime={timeValue} />
                </div>
              )}
            </div>

            {/* Seater Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <input
                type="number"
                name="seater"
                placeholder="Number of seats"
                className={FIELD_CLASS}
                value={seaterValue}
                onChange={(e) => setSeaterValue(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Per Seat Price */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-gray-400">$</span>
              </div>
              <input
                type="number"
                name="perSeat"
                placeholder="Price per seat"
                className={FIELD_CLASS}
                value={perSeatValue}
                onChange={(e) => setPerSeatValue(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Whole Jet Price */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-gray-400">$</span>
              </div>
              <input
                type="number"
                name="wholeJet"
                placeholder="Price for whole jet"
                className={FIELD_CLASS}
                value={wholeJetValue}
                onChange={(e) => setWholeJetValue(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Is Booked Toggle */}
            <div className="flex items-center h-12">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isBooked}
                    onChange={() => setIsBooked(!isBooked)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${isBooked ? "bg-blue-600" : "bg-gray-300"}`} />
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${
                      isBooked ? "translate-x-6" : ""
                    }`}
                  />
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {isBooked ? "Booked" : "Available"}
                </div>
              </label>
            </div>
          </div>

          {/* Aircraft Image Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aircraft Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="aircraft-image"
                  className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP · max ~1 MB</p>
                  </div>
                  <input
                    type="file"
                    id="aircraft-image"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="w-32 h-32 relative border rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Plane preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-md"
                    aria-label="Remove image"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingDeal(null);
              }}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Clear
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : editingDeal !== null
                ? "Update Deal"
                : "Add Deal"}
            </button>
          </div>
        </form>
      </div>

      {/* Deals Table */}
      {deals.length > 0 && (
        <div ref={tableRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  {["Aircraft", "Route", "Date/Time", "Seats", "Per Seat", "Whole Jet", "Status", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals
                  .slice((page - 1) * DEALS_PAGE_SIZE, page * DEALS_PAGE_SIZE)
                  .map((deal) => {
                  const index = deals.indexOf(deal);
                  return (
                  <tr key={deal._id ?? index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {deal.image ? (
                          <div className="h-12 w-16 flex-shrink-0 mr-4">
                            <img src={deal.image} alt={deal.plane} className="h-12 w-16 object-cover rounded" />
                          </div>
                        ) : (
                          <div className="h-12 w-16 bg-gray-200 flex-shrink-0 mr-4 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{deal.plane}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{deal.from}</div>
                        <div className="text-sm text-gray-500">to {deal.to}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.date}</div>
                      <div className="text-sm text-gray-500">{deal.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deal.seater}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${money(deal.perSeat)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${money(deal.wholeJet)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deal.booked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {deal.booked ? "Booked" : "Available"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(index)} className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(index)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4">
            <Pagination
              page={page}
              pageSize={DEALS_PAGE_SIZE}
              total={deals.length}
              onChange={setPage}
              label="deals"
            />
          </div>
        </div>
      )}

      {deals.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No leg deals added yet. Create your first deal using the form above.
        </div>
      )}
    </div>
  );
}
