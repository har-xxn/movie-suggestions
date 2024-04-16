import React, { useState } from 'react';
import './App.css';
const { GoogleGenerativeAI } = require("@google/generative-ai");


const OptionSelector = ({ title, identifier, currentValue, updateValue, choices }) => {
  return (
    <div className="setting-field">
      <label htmlFor={identifier} className="setting-title">{title}</label>
      <select id={identifier} value={currentValue} onChange={(e) => updateValue(e.target.value)}>
        {choices.map((choice) => (
          <option key={choice} value={choice}>{choice}</option>
        ))}
      </select>
    </div>
  );
};

function displayRecommendations(movieData) {
  const suggestionsArea = document.querySelector('.movie-suggestions');
  suggestionsArea.innerHTML = ''; // Clear previous results

  const intro = document.createElement('p');
  intro.textContent = "Check out these cinematic gems:";
  suggestionsArea.appendChild(intro);

  if (movieData.length === 0) {
    const errorNotice = document.createElement('p'); 
    errorNotice.textContent = 'Hmm... try broadening your criteria.';
    errorNotice.style.color = 'red'; // A little error styling
    suggestionsArea.appendChild(errorNotice); 
    return;
  }

  const movieList = document.createElement('ul');
  movieData.forEach(suggestion => {
    // Find title and description boundaries
    const titleMarkerIndex = suggestion.indexOf(': ') + 2; 
    const descMarkerIndex = suggestion.indexOf('Desc:');

    if (descMarkerIndex === -1) {
      // Handle cases without 'Desc:' 
      return null;
    }

    const title = suggestion.substring(titleMarkerIndex, descMarkerIndex);
    const description = suggestion.substring(descMarkerIndex + 5); 

    const listItem = document.createElement('li');

    // Build title with emphasis
    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = 'bold';
    titleSpan.style.fontStyle = 'italic';
    titleSpan.textContent = title;
    listItem.appendChild(titleSpan);

    // Add space and description
    listItem.appendChild(document.createTextNode(' - '));
    listItem.appendChild(document.createTextNode(description));

    // Create IMDB link
    const imdbSearch = document.createElement('a');
    imdbSearch.href = `https://www.imdb.com/find?q=${encodeURIComponent(title)}`;
    imdbSearch.textContent = ' (Explore on IMDB)';
    imdbSearch.target = '_blank';
    listItem.appendChild(imdbSearch);

    movieList.appendChild(listItem);
  });
  suggestionsArea.appendChild(movieList);
}

function App() {
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [selectedEra, setSelectedEra] = useState('2010s');
  const [desiredGenre, setDesiredGenre] = useState('Sci-Fi'); 
  const [moodDescription, setMoodDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY); 
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});

    try {
      const request = `Craft a movie list based on this description: ${moodDescription}.  Favor films in ${preferredLanguage} released during the ${selectedEra} within the ${desiredGenre} style. Ensure each movie suggestion starts with "Mov:" and the description with "Desc:". Keep these as a single line. Provide release years too!`;

      const result = await model.generateContent(request);
      
      const response = await result.response;     
      const movieSuggestions = response.text().split('\n');

      // Display the results directly
      displayRecommendations(movieSuggestions); 

    } catch (error) {
      console.error("Gemini Error:", error); 
      // Consider displaying a user-friendly error message in the UI
    }
  }

  return (
    <div id="app-container">
      <h2>AI Powered Movie Suggestions</h2> 
      <div className="movie-suggestions">
        {/* Movie recommendation display will go here */}
      </div>
      <div className="input-section">
        <form onSubmit={handleSubmit}> 
          <OptionSelector
            title="Preferred Language:"
            identifier="language"
            currentValue={preferredLanguage}
            updateValue={setPreferredLanguage}
            choices={['Any', 'English', 'Hindi', 'French', 'Telugu', 'Tamil', 'Korean']}
          />
          <OptionSelector
            title="Release Decade:"
            identifier="decade"
            currentValue={selectedEra}
            updateValue={setSelectedEra}
            choices={['Any', '1980s', '1990s', '2000s', '2010s', '2020s']}
          />
          <OptionSelector
            title="Preferred Genre:"
            identifier="genre"
            currentValue={desiredGenre}
            updateValue={setDesiredGenre}
            choices={['Any', 'Action', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller']}
          />
          <div className="description-row">
            <label htmlFor="description">Enter a prompt for the movie you would like to watch:</label>
            <textarea 
              id="description" 
              value={moodDescription}
              onChange={(e) => setMoodDescription(e.target.value)}
            ></textarea>
          </div>
          <button id="search-button">Give Suggestions</button> 
        </form>
      </div>
    </div>
  );
}

export default App;
