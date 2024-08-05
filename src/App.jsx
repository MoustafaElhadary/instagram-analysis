import './App.css'
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, UserMinus, UserPlus, UserCheck, Send, Clock, Grid, List } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InstagramFollowerAnalyzer = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [viewMode, setViewMode] = useState('notFollowingBack');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [displayMode, setDisplayMode] = useState('grid');

  const handleFileUpload = (event, setStateFunction, key = null) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const users = key ? json[key] : (json.relationships_following || json);
        setStateFunction(users.map(user => ({
          username: user.string_list_data[0].value,
          timestamp: user.string_list_data[0].timestamp
        })));
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Error parsing JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const notFollowingBack = useMemo(() => {
    return following.filter(user => 
      !followers.some(follower => follower.username === user.username)
    );
  }, [followers, following]);

  const notFollowedBack = useMemo(() => {
    return followers.filter(user => 
      !following.some(followedUser => followedUser.username === user.username)
    );
  }, [followers, following]);

  const getSortedUsers = (users) => {
    return [...users].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      } else {
        return sortOrder === 'asc' 
          ? a.username.localeCompare(b.username)
          : b.username.localeCompare(a.username);
      }
    });
  };

  const sortedUsers = useMemo(() => {
    switch(viewMode) {
      case 'notFollowingBack':
        return getSortedUsers(notFollowingBack);
      case 'notFollowedBack':
        return getSortedUsers(notFollowedBack);
      case 'receivedRequests':
        return getSortedUsers(receivedRequests);
      case 'sentRequests':
        return getSortedUsers(sentRequests);
      default:
        return [];
    }
  }, [viewMode, notFollowingBack, notFollowedBack, receivedRequests, sentRequests, sortBy, sortOrder]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getMonthlyData = () => {
    const data = {
      followers: followers,
      following: following,
      receivedRequests: receivedRequests,
      sentRequests: sentRequests
    };

    const monthlyData = {};

    Object.entries(data).forEach(([key, users]) => {
      users.forEach(user => {
        const date = new Date(user.timestamp * 1000);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
            followers: 0,
            following: 0,
            receivedRequests: 0,
            sentRequests: 0
          };
        }

        monthlyData[monthYear][key]++;
      });
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const monthlyData = useMemo(getMonthlyData, [followers, following, receivedRequests, sentRequests]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Instagram Follower Analyzer</h1>

      {/* File upload inputs */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Followers JSON</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setFollowers)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Following JSON</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setFollowing)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Received Requests JSON</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setReceivedRequests, 'relationships_follow_requests_received')}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Sent Requests JSON</label>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setSentRequests, 'relationships_follow_requests_sent')}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      </div>


      {(followers.length > 0 || following.length > 0 || receivedRequests.length > 0 || sentRequests.length > 0) && (
        <div className="mt-8">
          {/* View mode buttons */}
          <div className="flex flex-wrap justify-center items-center mb-4 gap-2">
            <button
              onClick={() => setViewMode('notFollowingBack')}
              className={`px-4 py-2 rounded-full ${viewMode === 'notFollowingBack' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <UserMinus className="inline-block mr-2" size={18} />
              Not Following Back ({notFollowingBack.length})
            </button>
            <button
              onClick={() => setViewMode('notFollowedBack')}
              className={`px-4 py-2 rounded-full ${viewMode === 'notFollowedBack' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <UserPlus className="inline-block mr-2" size={18} />
              Not Followed Back ({notFollowedBack.length})
            </button>
            <button
              onClick={() => setViewMode('receivedRequests')}
              className={`px-4 py-2 rounded-full ${viewMode === 'receivedRequests' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <UserCheck className="inline-block mr-2" size={18} />
              Received Requests ({receivedRequests.length})
            </button>
            <button
              onClick={() => setViewMode('sentRequests')}
              className={`px-4 py-2 rounded-full ${viewMode === 'sentRequests' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              <Send className="inline-block mr-2" size={18} />
              Sent Requests ({sentRequests.length})
            </button>
          </div>

          {/* Sort and display mode controls */}
          <div className="flex justify-center items-center mb-4 gap-2">
            <button
              onClick={() => toggleSort('name')}
              className={`px-4 py-2 rounded-full ${sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`px-4 py-2 rounded-full ${sortBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
            </button>
            <button
              onClick={() => setDisplayMode(displayMode === 'grid' ? 'table' : 'grid')}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700"
            >
              {displayMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
          </div>

          {/* User list display */}
          {displayMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedUsers.map((user, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-300">
                  <a href={`https://www.instagram.com/${user.username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold">
                    @{user.username}
                  </a>
                  <p className="text-sm text-gray-600 mt-2">
                    <Clock className="inline-block mr-1" size={14} />
                    {viewMode === 'notFollowingBack' && 'Followed on: '}
                    {viewMode === 'notFollowedBack' && 'Followed you on: '}
                    {viewMode === 'receivedRequests' && 'Request received on: '}
                    {viewMode === 'sentRequests' && 'Request sent on: '}
                    {formatDate(user.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <a href={`https://www.instagram.com/${user.username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold">
                        @{user.username}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                      {formatDate(user.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Activity over time graph */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Activity Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="followers" stroke="#8884d8" name="New Followers" />
                <Line type="monotone" dataKey="following" stroke="#82ca9d" name="New Following" />
                <Line type="monotone" dataKey="receivedRequests" stroke="#ffc658" name="Received Requests" />
                <Line type="monotone" dataKey="sentRequests" stroke="#ff7300" name="Sent Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramFollowerAnalyzer;