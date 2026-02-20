import SMCDashboard from './smc_dashboard_vercel';

export default function App() {
  return <SMCDashboard />;
}
```

Your repository should then look like this:
```
your-repo/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   └── smc_dashboard_vercel.jsx
└── package.json
