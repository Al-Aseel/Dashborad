# Website Review Button

This feature adds a convenient button for admins to review the website as end users see it.

## Features

- **Header Button**: A "مراجعة الموقع" (Review Website) button in the dashboard header for quick access
- **Quick Actions Button**: A "مراجعة الموقع" button in the main dashboard quick actions section
- **Dynamic URL Detection**: Automatically fetches the website URL from the settings API endpoint
- **Loading States**: Shows loading indicator while fetching the website URL
- **Fallback Support**: Falls back to environment variables or default URL if API fails

## Configuration

### Primary Source: Settings API

The website URL is primarily fetched from the settings API endpoint (`/api/v1/setting`). The system looks for the `website` field in the response:

```json
{
  "status": "sucsess",
  "data": {
    "website": "http://www.elaseel.org"
    // ... other settings
  }
}
```

### Fallback Behavior

If the settings API fails or doesn't contain a website URL, the system will:

1. Try `NEXT_PUBLIC_WEBSITE_URL` environment variable
2. Derive the URL from `NEXT_PUBLIC_API_BASE_URL` by removing `/api/v1`
3. Fall back to `https://elaseel.org` as the default

### Environment Variables (Optional)

You can still set a fallback URL in your `.env.local` file:

```bash
# Fallback website URL (optional)
NEXT_PUBLIC_WEBSITE_URL=https://your-website.com
```

## Usage

### For Admins

1. **Header Access**: Click the "مراجعة الموقع" button in the top-right header area
2. **Dashboard Access**: Click the "مراجعة الموقع" button in the Quick Actions section on the main dashboard

### Button Behavior

- Opens the public website in a new tab
- Uses `noopener,noreferrer` for security
- Styled with the dynamic theme colors
- Hover effects for better UX
- Shows loading state while fetching URL
- Disabled when URL is not available

## Technical Details

### Files Modified

- `components/shared/dashboard-layout.tsx` - Added header button with settings integration
- `app/page.tsx` - Added quick actions button with settings integration
- `lib/utils.ts` - Added `getPublicWebsiteUrlFromSettings()` function
- `hooks/use-website-url.ts` - New hook for managing website URL from settings

### Utility Functions

```typescript
// Async function to fetch website URL from settings API
export async function getPublicWebsiteUrlFromSettings(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/setting`);
    const data = await response.json();

    if (data.status === "sucsess" && data.data?.website) {
      return data.data.website;
    }

    // Fallback to environment variable or default
    return getPublicWebsiteUrl();
  } catch (error) {
    console.error("Failed to fetch website URL from settings:", error);
    // Fallback to environment variable or default
    return getPublicWebsiteUrl();
  }
}

// Fallback function for environment variables
export function getPublicWebsiteUrl(): string {
  // First try environment variable for public website URL
  if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL;
  }

  // Fallback: derive from API base URL by removing /api/v1
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    // Final fallback
    return "https://elaseel.org";
  }
}
```

### Custom Hook

```typescript
export const useWebsiteUrl = () => {
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsiteUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await getPublicWebsiteUrlFromSettings();
        setWebsiteUrl(url);
      } catch (err) {
        console.error("Error fetching website URL:", err);
        setError("Failed to fetch website URL");
        setWebsiteUrl("https://elaseel.org");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsiteUrl();
  }, []);

  return { websiteUrl, isLoading, error, refetch };
};
```

## Styling

The buttons use the dynamic theme colors and include:

- Border color matching the main theme color
- Hover effects with subtle background color changes
- Consistent styling with other dashboard buttons
- RTL support for Arabic text

## Security

- Opens in new tab with `noopener,noreferrer` attributes
- No sensitive data is passed to the external website
- Uses environment variables for configuration (not hardcoded URLs)
