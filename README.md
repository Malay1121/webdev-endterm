# SplitKaro

SplitKaro is a simple expense splitting web app made using the MERN stack. It is useful for trips, hostel rooms, flatmates or any plan where a group of friends spend money together and later get confused about who owes whom.

**Live link:** [splitkaro-ikwf.onrender.com](https://splitkaro-ikwf.onrender.com/)
**Demo video:** [drive.google.com/file/d/1x0_s6fVzMIQJXFr1WNygB-0k1R4ALh7B/view](https://drive.google.com/file/d/1x0_s6fVzMIQJXFr1WNygB-0k1R4ALh7B/view?usp=sharing)

## Problem Statement

When friends go on a trip or share a flat, one person usually pays for something and others pay for other things. After a few days nobody remembers who paid what, and calculating the final amount everyone owes is a headache. People end up using notes apps or whatsapp messages which gets messy.

SplitKaro solves this by letting you make a group, add expenses as they happen and automatically calculating the balances. It also shows the minimum number of payments needed to settle everything, so instead of everyone paying everyone, only a few transactions are needed.

## Features

- Signup / Login with JWT authentication (passwords hashed with bcrypt)
- Create groups and add friends using their registered email
- Add expenses with amount, category, date, who paid and who to split between (equal split)
- Delete expenses
- Search and filter expenses by category, and see category wise spending
- Net balance of every member in the group
- Suggested settlements (minimum payments) using a greedy debt simplification
- Mark a payment as paid, and view payment history
- Dashboard showing total you owe / are owed across all groups
- Only group members can see or change group data, only the creator can delete a group
- Responsive design, works on mobile too

## Tech Stack

| Part       | Tech                                         |
| ---------- | -------------------------------------------- |
| Frontend   | React (Vite), React Router, Axios, plain CSS |
| Backend    | Node.js, Express                             |
| Database   | MongoDB with Mongoose                        |
| Auth       | JSON Web Token, bcryptjs                     |
| Deployment | Render (single web service) + MongoDB Atlas  |

## Main Workflows

1. **Register / Login** - user creates an account, a token is saved in localStorage and sent with every request.
2. **Create a group and add members** - from the dashboard create a group, open it and add friends by email (they must have signed up first).
3. **Add an expense** - choose who paid, the amount, category and the people it is split between. Each person's share is shown before saving.
4. **Check balances** - the Balances tab shows how much each person gets back or owes, and the suggested payments to settle up.
5. **Settle up** - click "Mark paid" on a suggestion. It is saved as a payment, balances update and it shows in the Payments tab.

## How balances are calculated

For every expense the payer gets `+amount` and every person in the split gets `-amount / number of people`. For every payment the person who paid gets `+amount` and the receiver gets `-amount`. So a positive balance means you should get money back, negative means you owe.

To suggest settlements, people are divided into debtors and creditors, both sorted by amount. The biggest debtor pays the biggest creditor as much as possible, and this repeats until everyone is at zero. This keeps the number of transactions small.

## Folder Structure

```
webdev_endterm/
├── client/                 React frontend
│   └── src/
│       ├── components/     Navbar, ExpenseForm, Balances
│       ├── pages/          Home, Login, Register, Dashboard, GroupPage
│       ├── api.js          axios instance
│       ├── AuthContext.jsx login state
│       └── utils.js
├── server/                 Express backend
│   ├── models/             User, Group, Expense, Settlement
│   ├── routes/             auth, groups, expenses
│   ├── middleware/auth.js  JWT check
│   ├── utils/balances.js   balance + settlement logic
│   └── index.js
└── package.json            build and start scripts for deployment
```

## API Endpoints

All routes except register and login need the header `Authorization: Bearer <token>`.

| Method | Route                       | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | /api/auth/register          | create account                  |
| POST   | /api/auth/login             | login                           |
| GET    | /api/auth/me                | get logged in user              |
| GET    | /api/groups                 | my groups with my balance       |
| POST   | /api/groups                 | create group                    |
| GET    | /api/groups/:id             | group details                   |
| DELETE | /api/groups/:id             | delete group (creator only)     |
| POST   | /api/groups/:id/members     | add member by email             |
| GET    | /api/groups/:id/expenses    | list expenses                   |
| POST   | /api/groups/:id/expenses    | add expense                     |
| DELETE | /api/expenses/:id           | delete expense                  |
| GET    | /api/groups/:id/balances    | balances and suggested payments |
| GET    | /api/groups/:id/settlements | payment history                 |
| POST   | /api/groups/:id/settle      | record a payment                |

## Running Locally

You need Node.js (v18 or above) and a MongoDB database (local or a free MongoDB Atlas cluster).

1. Clone the repo

```
git clone <repo-url>
cd webdev_endterm
```

2. Setup the backend

```
cd server
npm install
```

Create a `.env` file inside `server/` (see `.env.example`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=some_random_secret
CLIENT_URL=http://localhost:5173
```

Then run

```
npm run dev
```

3. Setup the frontend (in another terminal)

```
cd client
npm install
npm run dev
```

Open http://localhost:5173. The vite dev server forwards `/api` requests to the backend on port 5000.

## Deployment

The app is deployed as one service on Render. Express serves the built React files, so frontend and backend are on the same URL.

- Build command: `npm run build`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET` (and optionally `CLIENT_URL`)

MongoDB Atlas is used as the database. In Atlas, Network Access should allow `0.0.0.0/0` so Render can connect.

## Future Improvements

- Unequal splits (by percentage or exact amounts)
- Email invites for people who have not signed up yet
- Editing an expense
- Charts for monthly spending
