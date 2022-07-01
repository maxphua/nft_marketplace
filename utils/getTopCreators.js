// create a function that returns an array of top sellers
// A top seller is aperson with a high sum of all NFTs they've listed

// example Input:
// [
//     {price:'2', seller:'A'},
//     {price:'3', seller:'B'},
//     {price:'3', seller'A'},
//     {price: '1', seller: 'C'}
// ]

// Example Output
// [
//     {sum:'5', seller:'A'},
//     {sum:'3', seller:'B'},
//     {sum:'1', seller:'C'}
// ]

// creators{
//     'creatorsObject': [{nft}, {nft}],
//     'creatorsObject': [{nft}, {nft}],
//     'creatorsObject': [{nft}, {nft}],
// }

// Object.entries
// [[A,B,C]], [[ {}, {}]]

export const getCreators = (nfts) => {
  const creators = nfts.reduce((creatorObject, nft) => {
    (creatorObject[nft.seller] = creatorObject[nft.seller] || []).push(nft);

    return creatorObject;
  }, {});

  return Object.entries(creators).map((creator) => {
    const seller = creator[0];
    const sum = creator[1].map((item) => Number(item.price)).reduce((prev, curr) => prev + curr, 0);

    return ({ seller, sum });
  });
};
