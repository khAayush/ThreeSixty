export const fetchGoogleProfileImage = async (idToken) => {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Google profile");
    }

    const userInfo = await response.json();
    return {
      picture: userInfo.picture,
      name: userInfo.name,
      email: userInfo.email,
      googleId: userInfo.id,
    };
  } catch (err) {
    console.error("Error fetching Google profile:", err);
    return null;
  }
};

export const constructGooglePictureUrl = (googleId) => {
  if (!googleId) return null;
  return `https://lh3.googleusercontent.com/a/${googleId}=s200-c`; // s200 = 200px size
};

export const refreshUserProfileImage = async (idToken, user) => {
  if (!idToken) return null;

  try {
    const googleProfile = await fetchGoogleProfileImage(idToken);

    if (googleProfile?.picture) {
      return {
        ...user,
        profileImage: googleProfile.picture,
        googleId: googleProfile.googleId,
      };
    }
    return null;
  } catch (err) {
    console.error("Error refreshing profile image:", err);
    return null;
  }
};
