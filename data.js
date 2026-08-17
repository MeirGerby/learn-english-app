// Word data for the English learning app, grouped by category.
// "word" and "example" stay in English (the language being taught);
// "definition" is the Hebrew meaning shown to the learner.
const WORD_DATA = {
  basics: [
    { word: "Hello", definition: "ברכה שאומרים כשפוגשים מישהו.", example: "Hello, how are you today?" },
    { word: "Goodbye", definition: "מילה שאומרים כשנפרדים ממישהו.", example: "She waved and said goodbye." },
    { word: "Please", definition: "משמש לבקשה מנומסת.", example: "Could you pass the salt, please?" },
    { word: "Thanks", definition: "ביטוי של הכרת תודה.", example: "Thanks for helping me move." },
    { word: "Sorry", definition: "ביטוי של התנצלות או חרטה.", example: "I'm sorry I was late." },
    { word: "Yes", definition: "משמש לתשובה חיובית.", example: "Yes, I would love to come." },
    { word: "No", definition: "משמש לתשובה שלילית.", example: "No, I haven't seen it." },
    { word: "Friend", definition: "אדם שמכירים היטב ואוהבים.", example: "He is my best friend." },
    { word: "Family", definition: "קבוצה של אנשים קרובים, כמו הורים וילדים.", example: "We are having a family dinner tonight." },
    { word: "Home", definition: "המקום שבו אדם גר.", example: "I can't wait to get home." }
  ],
  food: [
    { word: "Apple", definition: "פרי עגול בעל קליפה אדומה או ירוקה.", example: "She ate an apple for breakfast." },
    { word: "Bread", definition: "מאכל העשוי מקמח ומים אפויים.", example: "He bought a loaf of bread." },
    { word: "Water", definition: "נוזל שקוף הדרוש לחיים.", example: "Please drink more water." },
    { word: "Restaurant", definition: "מקום שבו מגישים ארוחות ללקוחות.", example: "We ate at a nice restaurant." },
    { word: "Delicious", definition: "טעים מאוד.", example: "This soup is delicious." },
    { word: "Hungry", definition: "מרגיש/ה צורך או רצון לאכול.", example: "I'm so hungry, let's eat now." },
    { word: "Recipe", definition: "הוראות להכנת מנה.", example: "She followed the recipe carefully." },
    { word: "Breakfast", definition: "הארוחה הראשונה של היום.", example: "We had eggs for breakfast." },
    { word: "Vegetable", definition: "צמח המשמש כמזון, כמו גזר או אפונה.", example: "He grows vegetables in his garden." },
    { word: "Dessert", definition: "מנה מתוקה שאוכלים בסוף הארוחה.", example: "Ice cream is my favorite dessert." }
  ],
  travel: [
    { word: "Airport", definition: "מקום שבו מטוסים ממריאים ונוחתים.", example: "We arrived at the airport early." },
    { word: "Passport", definition: "מסמך רשמי לנסיעות בין-לאומיות.", example: "Don't forget your passport." },
    { word: "Luggage", definition: "תיקים ומזוודות המשמשים לנסיעה.", example: "She checked her luggage at the counter." },
    { word: "Ticket", definition: "פתק המעיד ששילמתם עבור נסיעה או כניסה.", example: "He bought a train ticket." },
    { word: "Journey", definition: "מסע ממקום אחד למקום אחר.", example: "It was a long journey by bus." },
    { word: "Hotel", definition: "מקום המספק לינה בתשלום.", example: "We stayed at a hotel near the beach." },
    { word: "Map", definition: "שרטוט המציג את מאפייני האזור.", example: "Use the map to find your way." },
    { word: "Suitcase", definition: "מזוודה מלבנית לנשיאת בגדים בזמן נסיעה.", example: "He packed his suitcase for the trip." },
    { word: "Destination", definition: "המקום שאליו מישהו נוסע.", example: "Our final destination was Rome." },
    { word: "Explore", definition: "לנסוע באזור כדי להכיר אותו.", example: "They love to explore new cities." }
  ],
  business: [
    { word: "Meeting", definition: "התכנסות של אנשים לדיון בנושא מסוים.", example: "We have a meeting at 10 AM." },
    { word: "Deadline", definition: "הזמן שעד אליו צריך לסיים משהו.", example: "The deadline for the report is Friday." },
    { word: "Colleague", definition: "אדם שעובדים איתו.", example: "My colleague helped me finish the project." },
    { word: "Salary", definition: "כסף המשולם באופן קבוע עבור עבודה.", example: "She negotiated a higher salary." },
    { word: "Contract", definition: "הסכם כתוב בין צדדים.", example: "They signed the contract yesterday." },
    { word: "Manager", definition: "אדם האחראי על ניהול צוות או מחלקה.", example: "The manager approved my request." },
    { word: "Client", definition: "אדם המשתמש בשירותי חברה.", example: "We met with an important client today." },
    { word: "Budget", definition: "תוכנית לניצול כספים.", example: "The project stayed within budget." },
    { word: "Schedule", definition: "תוכנית של פעילויות בזמנים מסוימים.", example: "Check the schedule before you leave." },
    { word: "Negotiate", definition: "לדון כדי להגיע להסכם.", example: "They negotiated a better price." }
  ]
};

// Hebrew display labels for each category key.
const CATEGORY_LABELS = {
  basics: "בסיס",
  food: "אוכל",
  travel: "טיולים",
  business: "עסקים"
};
