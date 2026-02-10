"use client";

import { useState, useEffect } from "react";
import { PasswordUpdateModal } from "@/components/PasswordUpdateModal";

export function FirstLoginCheck({ userId, isFirstLogin }: { userId: string; isFirstLogin: boolean }) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isFirstLogin) {
            setShowModal(true);
        }
    }, [isFirstLogin]);

    return (
        <PasswordUpdateModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            userId={userId}
            isFirstTime={true}
        />
    );
}
