import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Food<span className="text-brand-500">Express</span>
            </span>
            <p className="mt-3 text-sm text-stone-400 max-w-sm">
              Enterprise Online Food Ordering System demonstration capstone project for B.Tech Computer Science & Engineering. Built with React, Node.js, Express, and MySQL 8.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-400">
              <span className="bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">MySQL InnoDB</span>
              <span className="bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">ACID Transactions</span>
              <span className="bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">3NF Normalized</span>
              <span className="bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">Triggers & Views</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Database Deliverables</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>schema.sql & seed.sql</li>
              <li>23+ Advanced SQL Queries</li>
              <li>ER Diagram & Data Dictionary</li>
              <li>Historical Price Snapshots</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Demo Credentials</h4>
            <div className="text-xs space-y-1.5 text-stone-400 bg-stone-800/80 p-3 rounded-lg border border-stone-700">
              <div><strong className="text-stone-200">Admin:</strong> admin@foodexpress.com</div>
              <div><strong className="text-stone-200">Customer:</strong> john.doe@example.com</div>
              <div><strong className="text-stone-200">Password:</strong> Password123!</div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© 2026 FoodExpress DBMS Capstone Project. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for College DBMS Practical Evaluation</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

