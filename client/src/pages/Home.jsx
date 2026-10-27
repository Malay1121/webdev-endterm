import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1>Split expenses with friends, without the headache</h1>
      <p>
        Going on a trip, sharing a flat or ordering food together? Add the expenses in a group and
        SplitKaro tells you exactly who owes whom.
      </p>
      <Link to="/register" className="btn">
        Get started
      </Link>

      <div className="features">
        <div className="card">
          <h3>Create groups</h3>
          <p>Make a group for your trip, hostel room or any plan and add your friends by email.</p>
        </div>
        <div className="card">
          <h3>Add expenses</h3>
          <p>Record who paid and who it should be split between. Equal split is done for you.</p>
        </div>
        <div className="card">
          <h3>Settle up</h3>
          <p>See the minimum number of payments needed to clear everything and mark them as paid.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
