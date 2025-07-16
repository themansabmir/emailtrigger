"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [manualEmails, setManualEmails] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    if (manualEmails.trim()) {
      // Normalize manual email input: split by comma, newline, or space
      const emails = manualEmails
        .split(/[\s,]+/)
        .map((email) => email.trim())
        .filter((email) => email && email.includes("@"));

      formData.append("emails", JSON.stringify(emails));
    }

    const res = await fetch("/api/send-email", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-xl'>
        <h1 className='text-4xl font-bold text-center sm:text-left'>
          Send Cold Emails
        </h1>

        <form onSubmit={onSubmit} className='flex flex-col gap-4 w-full'>
          <label className='font-semibold'>Upload Excel File (.xlsx):</label>
          <input
            type='file'
            name='file'
            accept='.xlsx'
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className='border p-2 rounded'
          />

          <div className='flex items-center justify-center text-gray-500 text-sm'>
            OR
          </div>

          <label className='font-semibold'>
            Enter Emails (comma, space, or newline separated):
          </label>
          <textarea
            rows={6}
            value={manualEmails}
            onChange={(e) => setManualEmails(e.target.value)}
            placeholder='example1@email.com, example2@email.com'
            className='border p-2 rounded w-full'
          />

          <button
            type='submit'
            disabled={loading}
            className='rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto'
          >
            {loading ? "Sending..." : "Send Emails"}
          </button>
        </form>

        {results.length > 0 && (
          <div className='w-full mt-8'>
            <h2 className='text-xl font-semibold mb-4'>Status:</h2>
            <ul className='space-y-2'>
              {results.map((result, idx) => (
                <li key={idx} className='text-sm'>
                  <span className='font-mono'>{result.email}</span> -{" "}
                  <span
                    className={`font-semibold ${
                      result.status === "sent"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.status}
                  </span>
                  {result.error && (
                    <span className='text-xs text-gray-500'>
                      {" "}
                      — {result.error}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
