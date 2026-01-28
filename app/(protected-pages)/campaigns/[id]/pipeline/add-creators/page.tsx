"use client";

import { Sidebar } from "@/components/common/Sidebar";
import { TopBar } from "@/components/common/TopBar";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Creator {
  id: string;
  name: string;
  email: string;
  handle: string;
  platform: string;
  followers: string;
  engagementRate: number;
  selected: boolean;
}

export default function AddCreatorsToPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [existingCreatorIds, setExistingCreatorIds] = useState<Set<string>>(new Set());

  // Fetch analyzed creators from database
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch analyzed creators from the user's creator analyses
        const response = await fetch("/api/user/analyses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const analysedCreators = (data.analyses || []).map((a: any) => ({
            id: a.id,
            name: a.name || "Unknown Creator",
            email: a.email || `${(a.handle || a.name || "creator").toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
            handle: a.handle || `@${(a.name || "").toLowerCase().replace(/\s+/g, "")}`,
            platform: a.platform || "Instagram",
            followers: a.followers || "0",
            engagementRate: a.alignmentScore ? Math.min(a.alignmentScore / 10, 10) : 0,
            selected: false,
          }));
          setCreators(analysedCreators);
        }

        // Fetch existing creators in this campaign's pipeline to exclude them
        const pipelineResponse = await fetch(`/api/campaigns/pipeline?campaignId=${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (pipelineResponse.ok) {
          const pipelineData = await pipelineResponse.json();
          const existingIds = new Set<string>(
            (pipelineData.creators || []).map((c: any) => c.creatorId)
          );
          setExistingCreatorIds(existingIds);
        }
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [campaignId]);

  const toggleCreator = (id: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setCreators((prev) => prev.map((c) => ({ ...c, selected: newState })));
  };

  const selectedCount = creators.filter((c) => c.selected).length;

  const handleAddToPipeline = async () => {
    const selectedCreators = creators.filter((c) => c.selected);
    if (selectedCreators.length === 0) {
      alert("Please select at least one creator");
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/campaigns/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "add_creators",
          campaignId,
          creators: selectedCreators.map((c) => ({
            creatorId: c.id,
            creatorName: c.name,
            creatorEmail: c.email,
            creatorHandle: c.handle,
            platform: c.platform,
            followers: c.followers,
            engagementRate: c.engagementRate,
          })),
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Added ${selectedCreators.length} creators to pipeline!`);
        router.push(`/campaigns/${campaignId}/pipeline`);
      } else {
        alert(result.error || "Failed to add creators");
      }
    } catch (error) {
      console.error("Error adding creators:", error);
      alert("Failed to add creators to pipeline");
    } finally {
      setAdding(false);
    }
  };

  const filteredCreators = creators.filter(
    (c) =>
      // Exclude creators already in the pipeline
      !existingCreatorIds.has(c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.platform.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Add Creators" />
          <div className="page-content">
            <div className="loading">Loading creators...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <TopBar title="Add Creators" />
        <div className="page-content">
          <div className="page-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => router.back()}>
                ← Back
              </button>
              <h1>Add Creators to Pipeline</h1>
              <p>Select creators to add to your campaign pipeline</p>
            </div>
            <div className="header-right">
              <span className="selected-count">{selectedCount} selected</span>
              <button
                className="add-btn"
                onClick={handleAddToPipeline}
                disabled={selectedCount === 0 || adding}
              >
                {adding ? "Adding..." : `Add to Pipeline →`}
              </button>
            </div>
          </div>

          <div className="controls">
            <div className="search-box">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="select-all-btn" onClick={toggleSelectAll}>
              {selectAll ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="creators-grid">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className={`creator-card ${creator.selected ? "selected" : ""}`}
                onClick={() => toggleCreator(creator.id)}
              >
                <div className="checkbox">
                  {creator.selected && <i className="fa-solid fa-check"></i>}
                </div>
                <div className="creator-avatar">{creator.name.charAt(0)}</div>
                <div className="creator-info">
                  <h3>{creator.name}</h3>
                  <p>{creator.handle}</p>
                  <div className="creator-meta">
                    <span className="platform">{creator.platform}</span>
                    <span className="followers">{creator.followers}</span>
                    <span className="engagement">{creator.engagementRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCreators.length === 0 && (
            <div className="no-results">
              {creators.length === 0 ? (
                <p>No analyzed creators found. <a href="/creators/discover">Discover and analyze creators</a> first.</p>
              ) : existingCreatorIds.size === creators.length ? (
                <p>All your analyzed creators are already in this campaign.</p>
              ) : (
                <p>No creators found matching your search.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .page-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #718096;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-left h1 {
          margin: 8px 0 4px;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
        }

        .header-left p {
          color: #718096;
          margin: 0;
        }

        .back-btn {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selected-count {
          background: #e2e8f0;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          color: #4a5568;
        }

        .add-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 0 16px;
        }

        .search-box i {
          color: #a0aec0;
          margin-right: 12px;
        }

        .search-box input {
          flex: 1;
          border: none;
          padding: 12px 0;
          font-size: 14px;
          outline: none;
        }

        .select-all-btn {
          padding: 12px 20px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #4a5568;
        }

        .select-all-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .creators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .creator-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .creator-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .creator-card.selected {
          border-color: #667eea;
          background: linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .creator-card.selected .checkbox {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        .creator-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
          flex-shrink: 0;
        }

        .creator-info {
          flex: 1;
        }

        .creator-info h3 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #1a202c;
        }

        .creator-info p {
          margin: 0 0 8px;
          color: #718096;
          font-size: 14px;
        }

        .creator-meta {
          display: flex;
          gap: 8px;
        }

        .creator-meta span {
          padding: 4px 8px;
          background: #f7fafc;
          border-radius: 4px;
          font-size: 12px;
          color: #4a5568;
        }

        .platform {
          background: #e2e8f0 !important;
        }

        .engagement {
          color: #10b981 !important;
          background: #d1fae5 !important;
        }

        .no-results {
          text-align: center;
          padding: 48px;
          color: #718096;
        }
      `}</style>
    </div>
  );
}
