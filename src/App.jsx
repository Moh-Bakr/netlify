import React, {useContext, useEffect, useState} from "react";
import Header from "./components/Header";
import {UserContext} from "./context/UserContext";
import Register from "./components/Register";
import Login from "./components/Login";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import PokemonModal from "./components/PokemonModal";
import moment from "moment";


const App = () => {
    const [message, setMessage] = useState("");
    const [token] = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [AllPokemons, setAllPokemons] = useState(null);
    const [FavPokemons, setFavPokemons] = useState(null);
    const [activeModal, setActiveModal] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [id, setId] = useState(null);


    const getWelcomeMessage = async () => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch("/api", requestOptions);
        const data = await response.json();

        if (!response.ok) {
            console.log("Error: " + response.message);
        } else {
            setMessage(data.message);
        }
    };
    const getAllPokemons = async () => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch("https://pokeapi.co/api/v2/pokemon", requestOptions);
        if (!response.ok) {
            setErrorMessage("Something went wrong. Couldn't load the pokemons");
            setTimeout(() => {
                setErrorMessage("")
            }, 1000)
        } else {
            const data = await response.json();
            setAllPokemons(data);
            setLoaded(true);
        }
    };
    const getFavPokemons = async () => {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        };
        const response = await fetch("/api/pokemons", requestOptions);
        if (!response.ok) {
            setErrorMessage("Something went wrong. Couldn't load the pokemons");
            setTimeout(() => {
                setErrorMessage("")
            }, 1000)
        } else {
            const data = await response.json();
            setFavPokemons(data);
            setLoaded(true);

        }
    };
    useEffect(() => {
        getFavPokemons();
    }, []);

    const handleModal = () => {
        setActiveModal(!activeModal);
        getFavPokemons();
        setId(null);
    };

    useEffect(() => {
        getAllPokemons();
    }, []);

    const handleModal1 = () => {
        setActiveModal(!activeModal);
        getAllPokemons();
        setId(null);
    };
    const addToFav = async (name, id, url) => {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                fav_pokemon: name,
                fav_id: id,
                url: url,
            }),
        };
        const response = await fetch("/api/Pokemons", requestOptions);
        if (!response.ok) {
            setErrorMessage("Something went wrong when adding pokemon to the favorite");
            setTimeout(() => {
                setErrorMessage("")
            }, 1000)
        } else {
            console.log({name: name, url: url, id: id})
            FavPokemons.push({fav_pokemon: name, url: url, fav_id: id, date_last_updated: Date.now()})
            setFavPokemons(FavPokemons)
            setSuccessMessage("added successfully to the favorite")
            setTimeout(() => {
                setSuccessMessage("")
            }, 3000)

        }
    };

    const deleteFav = async (id, index) => {
        const requestOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
        };
        fetch(`/api/pokemons/${id}`, requestOptions);
        console.log("before", FavPokemons)
        FavPokemons.slice(index, 1)
        console.log("after", FavPokemons)
        setSuccessMessage("removed successfully from the favorite")
        setTimeout(() => {
            setSuccessMessage("")
        }, 100)

        getFavPokemons();
    };

    useEffect(() => {
        getWelcomeMessage();
    }, []);
    return (
        <>
            <Header title={message}/>
            <div className="columns">
                <div className="column"></div>
                <div className="column m-5 is-two-thirds">
                    {!token ? (
                            <div className="columns">
                                <Register/> <Login/>
                            </div>
                        ) :
                        <div>
                            <PokemonModal
                                active={activeModal}
                                handleModal={handleModal1}
                                token={token}
                                id={id}
                                setErrorMessage={setErrorMessage}
                            />
                            <button
                                className="button is-fullwidth mb-5 is-success">
                                Favorite Pokemons
                            </button>
                            <ErrorMessage message={errorMessage}/>
                            {loaded && FavPokemons ? (
                                <table className="table is-fullwidth">
                                    <thead>
                                    <tr>
                                        <th>Favorite Pokemon</th>
                                        <th>URL</th>
                                        <th>Added</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {FavPokemons.map((pokemon, index) => (
                                        <tr key={pokemon.id + pokemon.fav_pokemon}>
                                            <td>{pokemon.fav_pokemon}</td>
                                            <td>{pokemon.url}</td>
                                            <td>{moment(pokemon.date_last_updated).format("MMM Do YY")}</td>
                                            <td>
                                                <button
                                                    className="button mr-2 is-danger is-light"
                                                    onClick={() => deleteFav(pokemon.fav_id, index)}
                                                >
                                                    Remove From Favorite
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Loading</p>
                            )}
                            <ErrorMessage message={errorMessage}/>
                            <SuccessMessage message={successMessage}/>
                            <button
                                className="button is-fullwidth mb-5 is-black">
                                Pokemons List
                            </button>
                            {loaded && AllPokemons ? (
                                <table className="table is-fullwidth">
                                    <thead>
                                    <tr>
                                        <th> Pokemon</th>
                                        <th>Url</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {AllPokemons.results.map((pokemon, id) => (
                                        <tr key={pokemon.id}>
                                            <td>{pokemon.name}</td>
                                            <td>{pokemon.url}</td>
                                            <td>
                                                <button
                                                    className="button mr-2 is-info is-light"
                                                    onClick={() => addToFav(pokemon.name, id, pokemon.url)}>
                                                    Add favorite
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Loading</p>
                            )}
                        </div>
                    }
                </div>
                <div className="column"></div>
            </div>
        </>

    );
};

export default App;