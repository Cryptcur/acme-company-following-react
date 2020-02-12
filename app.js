// const API = "https://acme-users-api-rev.herokuapp.com/api";

const fetchUser = async () => {
  const storage = window.localStorage;
  const userId = storage.getItem("userId");
  if (userId) {
    try {
      return (await axios.get(`${API}users/detail/${userId}`)).data;
    } catch (ex) {
      storage.removeItem("userId");
      return fetchUser();
    }
  }
  const user = (await axios.get(`${API}users/random`)).data;
  storage.setItem("userId", user.id);
  return user;
};

const { Component } = React;
const { render } = ReactDOM;

const API = "https://acme-users-api-rev.herokuapp.com/api/";
class App extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      companies: [],
      following: []
    };
  }
  async componentDidMount() {
    const user = await fetchUser();
    const following = (
      await axios.get(`${API}users/${user.id}/followingCompanies`)
    ).data;
    const companies = (await axios.get(`${API}companies`)).data;
    this.setState({ user: user, companies: companies, following: following });
  }

  render() {
    const { user, companies, following } = this.state;
    const updateChoice = async (val, idx) => {
      const { user, companies, following } = this.state;
      console.log(idx, val);
      if (val === "") {
        const toDelete = following.filter(elem => {
          console.log(companies[idx]);
          return companies[idx].id === following.companyId;
        })[0];
        console.log(toDelete);
        await axios.delete(
          `${API}users/${user.id}/followingCompanies/${toDelete.id}`
        );
      } else if (following.length === 5) {
        const toDelete = following.filter(elem => {
          return elem.rating === parseInt(val);
        })[0];
        console.log(toDelete);
        await axios.delete(
          `${API}users/${user.id}/followingCompanies/${toDelete.id}`
        );
      }
      await axios.post(`${API}users/${user.id}/followingCompanies`, {
        companyId: companies[idx].id,
        userId: user.id,
        rating: val
      });
    };
    const followFunc = ({ user, companies, following }) => {
      {
        return companies.map((company, idx) => {
          let bool = following.find(elem => {
            return elem.companyId === company.id;
          });
          return (
            <div
              key={company.id}
              id="companyItem"
              className={typeof bool === "object" ? "favorite" : ""}
            >
              {company.name}
              <select
                value={typeof bool === "object" ? bool.rating : ""}
                onChange={ev => updateChoice(ev.target.value, idx)}
              >
                {[null, 1, 2, 3, 4, 5].map(num => {
                  return <option key={num}>{num}</option>;
                })}
              </select>
            </div>
          );
        });
      }
    };
    return (
      <div>
        <h1>Acme company follower</h1>
        <h3>
          You ({user.fullName}) are following {following.length} Companies
        </h3>
        {followFunc({ user, companies, following })}
      </div>
    );
  }
}
const root = document.querySelector("#root");
render(<App />, root);
