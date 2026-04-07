"use client";
import { UserProfile } from "@/components/UserProfile";
import NotificationPopup from "@/components/NotificationPopup";

export default function GlobalNotifications() {
    const { data } = UserProfile();

    const isOwner = data?.role === "owner";

    if (!isOwner || !data) return null;

    return <NotificationPopup ownerId={data._id || data.id} />;
}
