import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  fetchEventById,
  fetchEventMatches,
} from "../../../../src/services/api";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // PDF generation variables
  let pdfDoc, currentPage, width, height, font, boldFont;
  const margin = 50;
  const lineHeight = 20;

  try {
    const { eventId } = req.query;
    console.log("Starting PDF export process for event:", eventId);

    // Fetch event and matches concurrently
    let eventData, matchesData;
    try {
      [eventData, matchesData] = await Promise.all([
        fetchEventById(eventId),
        fetchEventMatches(eventId),
      ]);
    } catch (error) {
      console.error("Error fetching event or matches:", {
        error: error.message,
        eventId,
        eventError: error.response?.data,
        status: error.response?.status,
      });
      return res.status(500).json({
        message: "Error fetching event data",
        details: error.response?.data || error.message,
      });
    }

    console.log("API Response Data:", {
      event: {
        id: eventData?._id,
        title: eventData?.title,
        name: eventData?.name,
        start: eventData?.start,
        date: eventData?.date,
        fields: eventData ? Object.keys(eventData) : [],
      },
      matches: {
        count: matchesData?.length,
        isArray: Array.isArray(matchesData),
        firstMatch: matchesData?.[0]
          ? {
              id: matchesData[0]._id,
              fighter1: matchesData[0].fighter1
                ? {
                    name: `${matchesData[0].fighter1.voornaam} ${matchesData[0].fighter1.achternaam}`,
                    fields: Object.keys(matchesData[0].fighter1),
                  }
                : null,
              fighter2: matchesData[0].fighter2
                ? {
                    name: `${matchesData[0].fighter2.voornaam} ${matchesData[0].fighter2.achternaam}`,
                    fields: Object.keys(matchesData[0].fighter2),
                  }
                : null,
              fields: Object.keys(matchesData[0]),
            }
          : null,
      },
    });

    if (!eventData) {
      console.error("Event not found:", { eventId });
      return res.status(404).json({ message: "Event not found" });
    }

    // Combine the data
    const event = {
      ...eventData,
      matches: Array.isArray(matchesData) ? matchesData : [],
    };

    // Validate required fields
    const validationErrors = [];

    if (!event.name && !event.title) {
      validationErrors.push("Event name/title is missing");
    }

    if (!event.date && !event.start) {
      validationErrors.push("Event date/start is missing");
    }

    if (!Array.isArray(event.matches)) {
      validationErrors.push("Invalid matches data format");
    }

    if (validationErrors.length > 0) {
      console.error("Validation errors:", {
        errors: validationErrors,
        event: {
          id: event._id,
          fields: Object.keys(event),
          hasName: !!(event.name || event.title),
          hasDate: !!(event.date || event.start),
          hasMatches: Array.isArray(event.matches),
          matchesCount: event.matches?.length,
        },
      });
      return res.status(500).json({
        message: "Validation failed",
        errors: validationErrors,
        eventInfo: {
          id: event._id,
          availableFields: Object.keys(event),
        },
      });
    }

    // Create a new PDF document
    console.log("Creating PDF document...");
    pdfDoc = await PDFDocument.create();
    currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
    ({ width, height } = currentPage.getSize());

    // Load fonts
    console.log("Loading fonts...");
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - margin;

    // Function to add a new page
    const addNewPage = () => {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
      return currentPage;
    };

    // Function to draw text with automatic page break
    const drawText = (text, options) => {
      if (!text) {
        console.warn("Attempted to draw undefined text:", options);
        text = "-"; // Fallback for undefined text
      }

      if (y < margin + lineHeight * 3) {
        currentPage = addNewPage();
      }

      currentPage.drawText(String(text), {
        ...options,
        y,
      });
      y -= options.size || lineHeight;
    };

    try {
      // Add event title
      const eventName = event.name || event.title;
      drawText(eventName, {
        x: margin,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      // Add event date
      const eventDate = event.date || event.start;
      const formattedDate = new Date(eventDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      drawText(formattedDate, {
        x: margin,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      y -= lineHeight * 2;

      // Add matches table header
      const tableHeaders = [
        "Vechter 1",
        "Gewicht",
        "VS",
        "Vechter 2",
        "Gewicht",
      ];
      const columnWidths = [180, 80, 40, 180, 80];
      let x = margin;

      // Draw table headers
      tableHeaders.forEach((header, index) => {
        drawText(header, {
          x,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        x += columnWidths[index];
      });
      y -= lineHeight;

      // Draw horizontal line
      currentPage.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= lineHeight;

      // Add matches
      for (const match of event.matches) {
        // Check if we need a new page
        if (y < margin + lineHeight * 3) {
          currentPage = addNewPage();
        }

        x = margin;
        // Fighter 1
        const fighter1Name =
          `${match.fighter1.voornaam} ${match.fighter1.achternaam}`.trim();
        drawText(fighter1Name, {
          x,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        x += columnWidths[0];

        // Weight 1
        drawText(match.weight1Confirmed ? "X" : "-", {
          x,
          size: 12,
          font: font,
          color: match.weight1Confirmed ? rgb(0, 0.5, 0) : rgb(0.5, 0.5, 0.5),
        });
        x += columnWidths[1];

        // VS
        drawText("VS", {
          x,
          size: 12,
          font: boldFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        x += columnWidths[2];

        // Fighter 2
        const fighter2Name =
          `${match.fighter2.voornaam} ${match.fighter2.achternaam}`.trim();
        drawText(fighter2Name, {
          x,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        x += columnWidths[3];

        // Weight 2
        drawText(match.weight2Confirmed ? "X" : "-", {
          x,
          size: 12,
          font: font,
          color: match.weight2Confirmed ? rgb(0, 0.5, 0) : rgb(0.5, 0.5, 0.5),
        });

        y -= lineHeight * 1.5;
      }

      // Add footer with page numbers
      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        page.drawText(`Pagina ${index + 1} van ${pages.length}`, {
          x: margin,
          y: margin,
          size: 10,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      });

      // Save the PDF
      console.log("Saving PDF...");
      const pdfBytes = await pdfDoc.save();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="wedstrijdblad-${eventName
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`
      );

      // Send the PDF
      res.status(200).send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating PDF content:", {
        error: error.message,
        stack: error.stack,
        event: {
          id: event._id,
          name: event.name || event.title,
          date: event.date || event.start,
          matchesCount: event.matches?.length,
        },
      });
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Error in PDF export handler:", {
      error: error.message,
      stack: error.stack,
      eventId: req.query.eventId,
      response: error.response?.data,
    });
    res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
      details: error.response?.data || "No additional details available",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
