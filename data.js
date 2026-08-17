// Word data for the English learning app, grouped by category.
// "word" and "example" stay in English (the language being taught);
// "translation" is the Hebrew word/phrase the learner is matching it to.
const WORD_DATA = {
  basics: [
    { word: "Hello", translation: "שלום", example: "Hello, how are you today?" },
    { word: "Goodbye", translation: "להתראות", example: "She waved and said goodbye." },
    { word: "Please", translation: "בבקשה", example: "Could you pass the salt, please?" },
    { word: "Thanks", translation: "תודה", example: "Thanks for helping me move." },
    { word: "Sorry", translation: "סליחה", example: "I'm sorry I was late." },
    { word: "Yes", translation: "כן", example: "Yes, I would love to come." },
    { word: "No", translation: "לא", example: "No, I haven't seen it." },
    { word: "Friend", translation: "חבר", example: "He is my best friend." },
    { word: "Family", translation: "משפחה", example: "We are having a family dinner tonight." },
    { word: "Home", translation: "בית", example: "I can't wait to get home." }
  ],
  food: [
    { word: "Apple", translation: "תפוח", example: "She ate an apple for breakfast." },
    { word: "Bread", translation: "לחם", example: "He bought a loaf of bread." },
    { word: "Water", translation: "מים", example: "Please drink more water." },
    { word: "Restaurant", translation: "מסעדה", example: "We ate at a nice restaurant." },
    { word: "Delicious", translation: "טעים", example: "This soup is delicious." },
    { word: "Hungry", translation: "רעב", example: "I'm so hungry, let's eat now." },
    { word: "Recipe", translation: "מתכון", example: "She followed the recipe carefully." },
    { word: "Breakfast", translation: "ארוחת בוקר", example: "We had eggs for breakfast." },
    { word: "Vegetable", translation: "ירק", example: "He grows vegetables in his garden." },
    { word: "Dessert", translation: "קינוח", example: "Ice cream is my favorite dessert." }
  ],
  travel: [
    { word: "Airport", translation: "שדה תעופה", example: "We arrived at the airport early." },
    { word: "Passport", translation: "דרכון", example: "Don't forget your passport." },
    { word: "Luggage", translation: "כבודה", example: "She checked her luggage at the counter." },
    { word: "Ticket", translation: "כרטיס", example: "He bought a train ticket." },
    { word: "Journey", translation: "מסע", example: "It was a long journey by bus." },
    { word: "Hotel", translation: "מלון", example: "We stayed at a hotel near the beach." },
    { word: "Map", translation: "מפה", example: "Use the map to find your way." },
    { word: "Suitcase", translation: "מזוודה", example: "He packed his suitcase for the trip." },
    { word: "Destination", translation: "יעד", example: "Our final destination was Rome." },
    { word: "Explore", translation: "לחקור", example: "They love to explore new cities." }
  ],
  business: [
    { word: "Meeting", translation: "פגישה", example: "We have a meeting at 10 AM." },
    { word: "Deadline", translation: "מועד אחרון", example: "The deadline for the report is Friday." },
    { word: "Colleague", translation: "עמית", example: "My colleague helped me finish the project." },
    { word: "Salary", translation: "משכורת", example: "She negotiated a higher salary." },
    { word: "Contract", translation: "חוזה", example: "They signed the contract yesterday." },
    { word: "Manager", translation: "מנהל", example: "The manager approved my request." },
    { word: "Client", translation: "לקוח", example: "We met with an important client today." },
    { word: "Budget", translation: "תקציב", example: "The project stayed within budget." },
    { word: "Schedule", translation: "לוח זמנים", example: "Check the schedule before you leave." },
    { word: "Negotiate", translation: "לנהל משא ומתן", example: "They negotiated a better price." }
  ]
};

// Hebrew display labels for each category key.
const CATEGORY_LABELS = {
  basics: "בסיס",
  food: "אוכל",
  travel: "טיולים",
  business: "עסקים"
};
