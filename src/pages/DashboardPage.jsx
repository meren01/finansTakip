import React from "react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="space-y-4">
        <Link to="/categories" className="block bg-blue-500 text-white p-4 rounded">
          Kategorileri Yönet
        </Link>
        <Link to="/transactions" className="block bg-green-500 text-white p-4 rounded">
          İşlemleri Yönet
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;

