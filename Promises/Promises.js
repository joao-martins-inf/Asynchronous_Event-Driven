const db = {
    getFullName: Promise.resolve('Jack Spratt'),
    getAddress: Promise.resolve('10 Clean Street'),
    getFavorites: Promise.resolve('Lean'),
};
Promise.all([
    db.getFullName,
    db.getAddress,
    db.getFavorites
])
    .then(results => {
        console.log("results are:", results);
        // results = ['Jack Spratt', '10 Clean Stree', 'Lean']
    })
    .catch(err => {console.log(err)})
