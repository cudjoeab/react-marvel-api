import React, { Component } from 'react';
import './App.css';
import { ResultsList } from './components/ResultsList';
import { ResultDetails } from './components/ResultDetails';
import { SearchBar } from './components/SearchBar';
import { Error } from './components/Error';
import { Loading } from './components/Loading';
import { MarvelService } from './services/MarvelService';
import { LoadMore } from './components/LoadMore'; 

class App extends Component {
  // --------------------------------------------------
  // SETUP
  // --------------------------------------------------
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      results: [],
      selectedResult: null,
    };

    this.fetchCharacters = this.fetchCharacters.bind(this);
    this.fetchCharacter = this.fetchCharacter.bind(this);

    this.marvelService = new MarvelService({
      apiKey: this.props.apiKey,
    });
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  render() {
    const resultsElem = this.state.hasError
      ? <Error />
      : this.state.isLoading
        ? <Loading searchTerm={ this.state.searchTerm } />
        : (
          <ResultsList
            results={ this.state.results }
            searchTerm={ this.state.searchTerm }
            onResultClick={ this.fetchCharacter }
          />
        );

    const detailsElem = this.state.selectedResult
      ? (
        <ResultDetails
          image={ this.state.selectedResult.thumbnail.path +  '.' + this.state.selectedResult.thumbnail.extension }
          title={ this.state.selectedResult.name }
          description={ this.state.selectedResult.description }
          stories={ this.state.selectedResult.stories }
          urls={ this.state.selectedResult.urls }
          onClose={ () => this.setState({ selectedResult: null } )}
        />
      )
      : '';

    let loadMoreElem = '';

    if (this.state.canLoadMore) {
      loadMoreElem = <LoadMore/>; 
    }

    return (
      <section className="app">
        <SearchBar
          searchTerm={ this.state.searchTerm }
          onSubmit={ (searchTerm) => this.setState({ searchTerm }) }
        />
        { resultsElem }
        { loadMoreElem }
        { detailsElem }
      </section>
    );
  }

  // --------------------------------------------------
  // LIFECYCLE
  // --------------------------------------------------
  componentDidUpdate(_, prevState) {
    const searchTerm = this.state.searchTerm;
    const prevSearchTerm = prevState.searchTerm;

    if (
      searchTerm
      && (searchTerm !== prevSearchTerm)
    ) {
      this.fetchCharacters();
    }
  }

  // --------------------------------------------------
  // FETCHING CHARACTERS
  // --------------------------------------------------
  fetchCharacters() {
    // TODO:
    // Put the application into a loading state.
    this.setState({ 
      isLoading : true, 
      
      
    })
    
    // Invoke the `getCharacters()` method on the marvel service.
    this.marvelService.getCharacters({ nameStartsWith : this.state.searchTerm})
    // Pass in the current `searchTerm` as `nameStartsWith`,
      .then((data) => {
        // Update the application state using the resulting data.
        // Remove the loading state.
        this.setState({ 
          results: data.results, 
          isLoading: false,
          canLoadMore: data.total > data.offset + data.count,

        });

      })
      // Handle potential errors.
      .catch((err) => {
        this.setState({ hasError : true})
      }); 
 
    
  }

  fetchCharacter(id) {
  
    // TODO:
    // Invoke the `getCharacter()` method on the marvel service.
    // Pass in the `id`.
    this.marvelService.getCharacter(id)
    // Update the application state using the resulting data.
      .then((data) => {
        const result = data.results[0];
        this.setState({ selectedResult : result }); 
      })
    // Handle potential errors.
      .catch((err) => {
        this.setState({ hasError : true }); 
      }); 
  }
  fetchMoreCharacters() {
    // Invoke the `getCharacters()` method on the marvel service.
    this.marvelService.getCharacters({ 
      nameStartsWith : this.state.searchTerm,
      offset: this.state.results.length, 
    })
    // Pass in the current `searchTerm` as `nameStartsWith`,
      .then((data) => {
        // Update the application state using the resulting data.
        // Remove the loading state.
        this.setState({ 
          results: [...this.state.results, ...data.results], 
          canLoadMore: data.total > data.offset + data.count,

        });

      })
      // Handle potential errors.
      .catch((err) => {
        this.setState({ hasError : true})
      }); 
  }
}

export default App;
