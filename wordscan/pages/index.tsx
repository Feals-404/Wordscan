"use client"
import * as React from "react";
import BottomButtons from "@/components/bottombuttons";
import SearchBar from "@/components/searchbar";
import Topbar from "@/components/topbar";

export default function Home() {
    return (
        <div className="flex justify-between flex-col h-screen">
            <Topbar />
            <SearchBar />
            <BottomButtons />
        </div>
    );
}