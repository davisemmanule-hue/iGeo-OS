window.IGEO_VENDOR_TRACKER_CONFIG = {
  ...(window.IGEO_INTEGRATIONS?.googleSheets?.vendorTracker || {}),
  tabs: [
    "Vendor Registrations",
    "Certifications",
    "SAM Tracking",
    "CAGE Tracking",
    "Renewals",
    "Documents",
  ],
};
