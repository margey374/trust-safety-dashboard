import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multiselect";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const [updates, setUpdates] = useState([]);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState([]);
  const [riskLevel, setRiskLevel] = useState([]);
  const [gender, setGender] = useState([]);
  const [impact, setImpact] = useState([]);
  const [mediaAttention, setMediaAttention] = useState([]);
  const [sentiment, setSentiment] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/get-latest-updates")
      .then((response) => response.json())
      .then((data) => {
        setUpdates(data);
        setCategories([...new Set(data.map(item => item.category))]);
      });
  }, []);

  const filteredUpdates = updates.filter((item) => {
    const publishedDate = new Date(item.published);
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (country.length === 0 || country.includes(item.country)) &&
      (riskLevel.length === 0 || riskLevel.includes(item.risk_level)) &&
      (gender.length === 0 || gender.includes(item.gender)) &&
      (impact.length === 0 || impact.includes(item.impact)) &&
      (mediaAttention.length === 0 || mediaAttention.includes(item.media_attention)) &&
      (sentiment.length === 0 || sentiment.includes(item.sentiment)) &&
      (!startDate || publishedDate >= new Date(startDate)) &&
      (!endDate || publishedDate <= new Date(endDate))
    );
  });

  return (
    <div className="p-6 flex gap-6">
      {/* Sidebar Filters */}
      <aside className="w-1/4 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <Switch checked={isAdmin} onCheckedChange={setIsAdmin} label="Admin Mode" className="mb-3" />
        <Input
          type="text"
          placeholder="Search updates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <MultiSelect onValueChange={setCountry} placeholder="Filter by Country" options={["US", "UK", "Canada", "Germany", "Australia"]} />
        <MultiSelect onValueChange={setRiskLevel} placeholder="Filter by Risk Level" options={["High Risk", "Medium Risk", "Low Risk"]} className="mt-3" />
        <MultiSelect onValueChange={setGender} placeholder="Filter by Gender" options={["Male", "Female", "Non-binary"]} className="mt-3" />
        <MultiSelect onValueChange={setImpact} placeholder="Filter by Impact" options={["High Impact", "Medium Impact", "Low Impact"]} className="mt-3" />
        <MultiSelect onValueChange={setMediaAttention} placeholder="Filter by Media Attention" options={["High", "Medium", "Low"]} className="mt-3" />
        <MultiSelect onValueChange={setSentiment} placeholder="Filter by Sentiment" options={["Positive", "Neutral", "Negative"]} className="mt-3" />
        <div className="mt-3">
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" className="mt-2" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="w-3/4">
        <h1 className="text-2xl font-bold mb-4">Trust & Safety Operations Dashboard</h1>
        {categories.map((category, idx) => (
          <section key={idx} className="mb-6">
            <h2 className="text-xl font-semibold">{category}</h2>
            {filteredUpdates.filter(u => u.category === category).map((update, index) => (
              <Card key={index} className={`p-4 mb-3 border ${update.risk_level === "High Risk" ? "border-red-500" : update.risk_level === "Medium Risk" ? "border-yellow-500" : "border-green-500"}`}>
                <CardContent>
                  <h3 className="text-lg font-bold">{update.title}</h3>
                  <p className="text-sm text-gray-600">{update.source}</p>
                  <p className="text-sm text-gray-500">Media Attention: {update.media_attention} | Sentiment: {update.sentiment} ({update.sentiment_percentage}%)</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge className={
                      update.risk_level === "High Risk" ? "bg-red-500 text-white" :
                      update.risk_level === "Medium Risk" ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
                    }>{update.risk_level}</Badge>
                    {isAdmin && <Button variant={update.risk_level === "High Risk" ? "destructive" : "default"}>Acknowledge & Assign</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;