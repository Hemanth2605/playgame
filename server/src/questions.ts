export interface Question {
  category: string;
  text: string;
  options: string[];
  /** Index into options of the correct answer. Never sent to clients. */
  answer: number;
}

export const QUESTIONS: Question[] = [
  // Science
  { category: 'Science', text: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Mars'], answer: 1 },
  { category: 'Science', text: 'What gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 2 },
  { category: 'Science', text: 'What is the chemical symbol for gold?', options: ['Au', 'Ag', 'Gd', 'Go'], answer: 0 },
  { category: 'Science', text: 'How many bones are in the adult human body?', options: ['186', '206', '226', '246'], answer: 1 },
  { category: 'Science', text: 'What force keeps planets orbiting the sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Inertia'], answer: 2 },
  { category: 'Science', text: 'Which blood type is the universal donor?', options: ['A+', 'B-', 'AB+', 'O-'], answer: 3 },

  // Geography
  { category: 'Geography', text: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], answer: 2 },
  { category: 'Geography', text: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 1 },
  { category: 'Geography', text: 'Which country has the largest population?', options: ['China', 'USA', 'India', 'Indonesia'], answer: 2 },
  { category: 'Geography', text: 'Mount Everest lies on the border of Nepal and which country?', options: ['India', 'China', 'Bhutan', 'Pakistan'], answer: 1 },
  { category: 'Geography', text: 'Which is the largest hot desert in the world?', options: ['Gobi', 'Sahara', 'Thar', 'Kalahari'], answer: 1 },
  { category: 'Geography', text: 'Which city is known as the "Big Apple"?', options: ['Los Angeles', 'Chicago', 'New York', 'Boston'], answer: 2 },

  // Technology
  { category: 'Technology', text: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'Hyper Terminal Text Program', 'Home Tool Transfer Protocol'], answer: 0 },
  { category: 'Technology', text: 'Who co-founded Apple along with Steve Jobs?', options: ['Bill Gates', 'Steve Wozniak', 'Elon Musk', 'Larry Page'], answer: 1 },
  { category: 'Technology', text: 'In which year was the first iPhone released?', options: ['2005', '2007', '2009', '2010'], answer: 1 },
  { category: 'Technology', text: 'Which company owns YouTube?', options: ['Meta', 'Microsoft', 'Google', 'Amazon'], answer: 2 },
  { category: 'Technology', text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Program Utility', 'Central Program Unit'], answer: 0 },
  { category: 'Technology', text: 'Which language runs natively in web browsers?', options: ['Python', 'Java', 'C++', 'JavaScript'], answer: 3 },

  // Movies
  { category: 'Movies', text: 'Who directed both "Titanic" and "Avatar"?', options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Martin Scorsese'], answer: 2 },
  { category: 'Movies', text: 'In "The Lion King", what is the name of Simba\'s father?', options: ['Scar', 'Mufasa', 'Rafiki', 'Zazu'], answer: 1 },
  { category: 'Movies', text: 'Which movie features the line "I\'ll be back"?', options: ['Predator', 'RoboCop', 'The Terminator', 'Die Hard'], answer: 2 },
  { category: 'Movies', text: 'What is the highest-grossing film of all time?', options: ['Titanic', 'Avengers: Endgame', 'Avatar', 'Star Wars: The Force Awakens'], answer: 2 },
  { category: 'Movies', text: 'Which film\'s song "Naatu Naatu" won an Oscar in 2023?', options: ['RRR', 'Pathaan', 'KGF 2', 'Brahmastra'], answer: 0 },
  { category: 'Movies', text: 'Who plays Iron Man in the Marvel movies?', options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'], answer: 2 },

  // Sports
  { category: 'Sports', text: 'How many players are on a cricket team?', options: ['9', '10', '11', '12'], answer: 2 },
  { category: 'Sports', text: 'Which country won the 2022 FIFA World Cup?', options: ['France', 'Brazil', 'Argentina', 'Germany'], answer: 2 },
  { category: 'Sports', text: 'In which sport is the term "slam dunk" used?', options: ['Volleyball', 'Basketball', 'Tennis', 'Badminton'], answer: 1 },
  { category: 'Sports', text: 'How often are the Summer Olympics held?', options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'], answer: 2 },
  { category: 'Sports', text: 'Which sport does Virat Kohli play?', options: ['Football', 'Hockey', 'Cricket', 'Kabaddi'], answer: 2 },
  { category: 'Sports', text: 'How many rings are on the Olympic flag?', options: ['4', '5', '6', '7'], answer: 1 },

  // History
  { category: 'History', text: 'Who was the first person to walk on the moon?', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'], answer: 2 },
  { category: 'History', text: 'In which year did India gain independence?', options: ['1945', '1947', '1950', '1942'], answer: 1 },
  { category: 'History', text: 'The Great Wall is located in which country?', options: ['Japan', 'Mongolia', 'China', 'Korea'], answer: 2 },
  { category: 'History', text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Van Gogh', 'Picasso', 'Leonardo da Vinci'], answer: 3 },
  { category: 'History', text: 'Which ancient wonder of the world was in Egypt?', options: ['Hanging Gardens of Babylon', 'Great Pyramid of Giza', 'Colossus of Rhodes', 'Temple of Artemis'], answer: 1 },
  { category: 'History', text: 'Who was known as the "Iron Man of India"?', options: ['Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Bhagat Singh', 'Subhas Chandra Bose'], answer: 1 },

  // Food
  { category: 'Food', text: 'Which country is the origin of pizza?', options: ['France', 'Spain', 'Italy', 'Greece'], answer: 2 },
  { category: 'Food', text: 'What is the main ingredient in guacamole?', options: ['Tomato', 'Avocado', 'Cucumber', 'Peas'], answer: 1 },
  { category: 'Food', text: 'Which spice is the most expensive by weight?', options: ['Cardamom', 'Vanilla', 'Saffron', 'Cinnamon'], answer: 2 },
  { category: 'Food', text: 'Sushi originated in which country?', options: ['China', 'Thailand', 'Japan', 'Korea'], answer: 2 },
  { category: 'Food', text: 'What is paneer made from?', options: ['Soybeans', 'Milk', 'Rice', 'Wheat'], answer: 1 },
  { category: 'Food', text: 'Which fruit is called the "king of fruits" in India?', options: ['Banana', 'Apple', 'Mango', 'Jackfruit'], answer: 2 },

  // General
  { category: 'General', text: 'How many colors are in a rainbow?', options: ['5', '6', '7', '8'], answer: 2 },
  { category: 'General', text: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], answer: 2 },
  { category: 'General', text: 'How many minutes are in a full day?', options: ['1240', '1440', '1640', '1840'], answer: 1 },
  { category: 'General', text: 'What currency is used in Japan?', options: ['Yuan', 'Won', 'Yen', 'Ringgit'], answer: 2 },
  { category: 'General', text: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: 1 },
  { category: 'General', text: 'Which animal is known as the "ship of the desert"?', options: ['Horse', 'Camel', 'Elephant', 'Donkey'], answer: 1 },
];
