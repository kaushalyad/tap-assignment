import React, { useEffect, useState } from "react";

function getNetworkInfo() {
  const nav = navigator;
  const info = nav.connection || nav.mozConnection || nav.webkitConnection;
  return info
    ? {
        type: info.type,
        effectiveType: info.effectiveType,
        downlink: info.downlink,
        rtt: info.rtt,
      }
    : null;
}

function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [netInfo, setNetInfo] = useState(getNetworkInfo());

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    let info = null;
    const updateNetInfo = () => setNetInfo(getNetworkInfo());
    if (navigator.connection) {
      info = navigator.connection;
      info.addEventListener("change", updateNetInfo);
    }
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (info) info.removeEventListener("change", updateNetInfo);
    };
  }, []);

  return (
    <div style={{ margin: "10px 0", color: online ? "green" : "red" }}>
      <strong>Network Status:</strong> {online ? "Online" : "Offline"}
      {netInfo && (
        <span style={{ color: "#333", marginLeft: 10 }}>
          | Type: {netInfo.type || "-"} | Effective: {netInfo.effectiveType || "-"} | Downlink: {netInfo.downlink || "-"} Mbps | RTT: {netInfo.rtt || "-"} ms
        </span>
      )}
    </div>
  );
}

export default NetworkStatus; 