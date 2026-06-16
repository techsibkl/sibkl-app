# Guest Mode Usage Examples

## Component-Level Access Control

### Example 1: Hide Features from Guest Users

```typescript
import { useAuthStore } from "@/stores/authStore";

export const ProfileScreen = () => {
  const { isGuest, isAuthenticated, user } = useAuthStore();

  if (isGuest) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold mb-4">
          Sign in to view your profile
        </Text>
        <Button onPress={() => router.push("/(auth)/sign-in")}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      {/* Profile content */}
    </View>
  );
};
```

### Example 2: Show Different Content Based on Auth State

```typescript
import { useAuthStore } from "@/stores/authStore";

export const HomeScreen = () => {
  const { isGuest, isAuthenticated, user } = useAuthStore();

  return (
    <ScrollView className="flex-1">
      {/* Public announcements - always visible */}
      <AnnouncementsSection />

      {/* Authenticated-only sections */}
      {isAuthenticated && !isGuest && (
        <>
          <PersonalFlowsSection userId={user?.people_id} />
          <AssignedTasksSection />
        </>
      )}

      {isGuest && (
        <View className="bg-blue-100 p-4 rounded">
          <Text className="font-semibold">
            Create an account to unlock more features
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
```

### Example 3: Use CASL Abilities for Fine-Grained Control

```typescript
import { useAuthStore } from "@/stores/authStore";

export const FeatureGate = ({ feature, children, fallback }: Props) => {
  const { ability } = useAuthStore();

  if (ability.can("read", feature)) {
    return children;
  }

  return fallback || <LockedFeaturePrompt featureName={feature} />;
};

// Usage
export const CellsScreen = () => {
  return (
    <FeatureGate feature="CellDetails" fallback={<SignInPrompt />}>
      <CellDetailsList />
    </FeatureGate>
  );
};
```

## API Usage Examples

### Example 1: Fetch Public Data (Guest or Authenticated)

```typescript
import { secureFetch } from "@/utils/secureFetch";

export const fetchAnnouncements = async () => {
  // Works for both guests and authenticated users
  const response = await secureFetch(
    "/api/announcements",
    { method: "GET" },
    { allowUnauthenticated: true } // Explicitly allow guests
  );
  return response.json();
};

// Guest: No Authorization header
// Authenticated: Authorization header included
```

### Example 2: Protected Endpoint (Requires Auth)

```typescript
import { secureFetch } from "@/utils/secureFetch";

export const fetchUserProfile = async () => {
  // This will throw for guests (no firebaseUser)
  const response = await secureFetch("/api/user/profile", {
    method: "GET",
  });
  return response.json();
};

// Wrap in try-catch to handle guest users gracefully:
export const fetchUserProfileSafe = async () => {
  try {
    return await fetchUserProfile();
  } catch (error) {
    if (error.message.includes("not signed in")) {
      console.log("Guest user - redirecting to login");
      // Handle guest user case
    }
  }
};
```

### Example 3: Guest-Aware API Call

```typescript
import { useAuthStore } from "@/stores/authStore";
import { secureFetch } from "@/utils/secureFetch";

export const usePublicData = () => {
  const { isGuest } = useAuthStore();

  const fetchData = async () => {
    try {
      const response = await secureFetch(
        "/api/public-data",
        { method: "GET" },
        { allowUnauthenticated: true }
      );
      const data = await response.json();

      // Log differently for guests vs authenticated users
      if (isGuest) {
        console.log("Guest viewed data:", data);
      } else {
        console.log("User viewed data:", data);
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch public data:", error);
      throw error;
    }
  };

  return { fetchData };
};
```

## Navigation Examples

### Example 1: Route Based on Auth State

```typescript
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export const useMaybeNavigate = () => {
  const { isAuthenticated, isGuest } = useAuthStore();

  const goToFeature = (authenticatedRoute: string, guestRoute: string) => {
    if (isAuthenticated && !isGuest) {
      router.push(authenticatedRoute);
    } else if (isGuest) {
      // Show upsell screen or features screen
      router.push(guestRoute);
    } else {
      router.push("/(auth)/sign-in");
    }
  };

  return { goToFeature };
};

// Usage
const handleCellPress = () => {
  goToFeature(
    { pathname: "/(app)/cells/[id]", params: { id: cellId } },
    "/(auth)/sign-in?upsell=cells"
  );
};
```

### Example 2: Sign In Prompt Modal

```typescript
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";

export const SignInPrompt = ({ feature = "feature" }: { feature?: string }) => {
  const { isGuest, isAuthenticated } = useAuthStore();

  if (isAuthenticated && !isGuest) return null;

  return (
    <View className="bg-white p-4 rounded-lg">
      <Text className="text-lg font-bold mb-2">
        Sign in to access {feature}
      </Text>
      <Text className="text-gray-600 mb-4">
        Create an account or sign in to continue.
      </Text>
      <TouchableOpacity
        className="bg-primary-600 p-3 rounded"
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text className="text-white font-bold text-center">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Testing Examples

### Example 1: Cypress/E2E Test

```typescript
// Guest flow
cy.visit("app");
cy.contains("Continue as Guest").click();
cy.url().should("include", "/home");
cy.contains("Announcements").should("be.visible");
cy.contains("Personal Flows").should("not.exist");

// Sign in from guest state
cy.contains("Sign In").click();
cy.get('[placeholder="Enter your email"]').type("test@example.com");
cy.get('[placeholder="Enter your password"]').type("password123");
cy.contains("Sign In").click();
cy.url().should("include", "/home");
cy.contains("Personal Flows").should("be.visible");
```

### Example 2: Store Testing

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useAuthStore } from "@/stores/authStore";

describe("Guest Mode", () => {
  it("should enable guest mode", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.guestLogin();
    });

    expect(result.current.isGuest).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.firebaseUser).toBeNull();
    expect(result.current.authLoaded).toBe(true);
  });

  it("should clear guest state on sign out", async () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.guestLogin();
    });

    expect(result.current.isGuest).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.isGuest).toBe(false);
    expect(result.current.firebaseUser).toBeNull();
  });
});
```

### Example 3: secureFetch Testing

```typescript
import { secureFetch } from "@/utils/secureFetch";
import { useAuthStore } from "@/stores/authStore";

describe("secureFetch with guest mode", () => {
  it("should not include Authorization header for guests", async () => {
    const { guestLogin } = useAuthStore.getState();
    guestLogin();

    // Mock fetch to capture headers
    global.fetch = jest.fn((url, init) => {
      expect(init?.headers?.Authorization).toBeUndefined();
      return Promise.resolve(new Response(JSON.stringify({})));
    });

    await secureFetch("/api/public", { method: "GET" });
    expect(global.fetch).toHaveBeenCalled();
  });
});
```

## Backend Example: Node.js/Express

```typescript
// Middleware to handle guest and authenticated requests
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const isGuest = !token;

  if (token) {
    // Verify token and set user
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.isGuest = false;
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    // Guest user
    req.user = null;
    req.isGuest = true;
  }

  next();
};

// Public endpoint - serves both guests and authenticated users
app.get("/api/announcements", authMiddleware, async (req, res) => {
  const announcements = await Announcement.find({
    public: true,
    // If user is authenticated, also include user-specific announcements
    ...(req.user && { role_ids: { $in: req.user.roles } }),
  });

  res.json({
    success: true,
    data: announcements,
    isGuest: req.isGuest,
  });
});

// Protected endpoint - authenticated users only
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  if (req.isGuest) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to view your profile",
    });
  }

  const user = await User.findById(req.user.uid);
  res.json({
    success: true,
    data: user,
  });
});
```

## Backend Example: Go/Gin

```go
// Middleware to extract and validate token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var isGuest bool
		var userID string

		if authHeader == "" {
			isGuest = true
		} else {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			// Validate token...
			decodedToken, err := app.Auth(context.Background()).VerifyIDToken(c, token)
			if err != nil {
				c.JSON(401, gin.H{"error": "Invalid token"})
				c.Abort()
				return
			}
			userID = decodedToken.UID
			isGuest = false
		}

		c.Set("isGuest", isGuest)
		c.Set("userID", userID)
		c.Next()
	}
}

// Public endpoint
func GetAnnouncements(c *gin.Context) {
	isGuest := c.GetBool("isGuest")
	userID, _ := c.Get("userID")

	query := bson.M{"public": true}

	if !isGuest {
		// Add user-specific announcements if authenticated
		query = bson.M{
			"$or": []bson.M{
				{"public": true},
				{"role_ids": bson.M{"$in": userRoles}},
			},
		}
	}

	announcements := // ... query
	c.JSON(200, gin.H{
		"success": true,
		"data":    announcements,
		"isGuest": isGuest,
	})
}
```
