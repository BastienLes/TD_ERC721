const Str = require('@supercharge/strings')
// const BigNumber = require('bignumber.js');

var TDErc20 = artifacts.require("ERC20TD.sol");
var ExerciceSolution = artifacts.require("ExerciceSolution.sol");
var evaluator = artifacts.require("Evaluator.sol");
var evaluator2 = artifacts.require("Evaluator2.sol");


module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        // await deployTDToken(deployer, network, accounts); 
        // await deployEvaluator(deployer, network, accounts); 
        // await setPermissionsAndRandomValues(deployer, network, accounts); 
        // await deployRecap(deployer, network, accounts); 
        await hardCodeContractAddress(deployer, network, accounts); 
        await testDeployment(deployer, network, accounts); 
    });
};

async function deployTDToken(deployer, network, accounts) {
	TDToken = await TDErc20.new("TD-ERC721-101","TD-ERC721-101",web3.utils.toBN("0"))
	
	// TDToken = await TDErc20.at("0x46a9Dc47185F769ef9a11927B0f9d2fd0dEc3304")
}

async function deployEvaluator(deployer, network, accounts) {
	Evaluator = await evaluator.new(TDToken.address)
	Evaluator2 = await evaluator2.new(TDToken.address)
}

async function setPermissionsAndRandomValues(deployer, network, accounts) {
	await TDToken.setTeacher(Evaluator.address, true)
	await TDToken.setTeacher(Evaluator2.address, true)
	randomNames = []
	randomLegs = []
	randomSex = []
	randomWings = []
	for (i = 0; i < 20; i++)
		{
		randomNames.push(Str.random(15))
		randomLegs.push(Math.floor(Math.random()*5))
		randomSex.push(Math.floor(Math.random()*2))
		randomWings.push(Math.floor(Math.random()*2))
		// randomTickers.push(web3.utils.utf8ToBytes(Str.random(5)))
		// randomTickers.push(Str.random(5))
		}

	console.log(randomNames)
	console.log(randomLegs)
	console.log(randomSex)
	console.log(randomWings)
	// console.log(web3.utils)
	// console.log(type(Str.random(5)0)
	await Evaluator.setRandomValuesStore(randomNames, randomLegs, randomSex, randomWings);
	await Evaluator2.setRandomValuesStore(randomNames, randomLegs, randomSex, randomWings);
}

async function deployRecap(deployer, network, accounts) {
	console.log("TDToken " + TDToken.address)
	console.log("Evaluator " + Evaluator.address)
	console.log("Evaluator2 " + Evaluator2.address)
}

async function hardCodeContractAddress(deplaoyer, network, accounts){
	TDToken = await TDErc20.at("0x8B7441Cb0449c71B09B96199cCE660635dE49A1D")
	Evaluator = await evaluator.at("0xa0b9f62A0dC5cCc21cfB71BA70070C3E1C66510E")
	Evaluator2 = await evaluator2.at("0x4f82f7A130821F61931C7675A40fab723b70d1B8")
}

async function testDeployment(deployer, network, accounts) {
	// init
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Init balance : " + getBalance.toString());
		
	ExSol = await ExerciceSolution.new("ERC721BAS", "ERC721BAS", Evaluator.address, 1, {from: accounts[0]});	


	// ex0
	await Evaluator.submitExercice(ExSol.address, {from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex0 balance : " + getBalance.toString());

	// ex1
	await Evaluator.ex1_testERC721({from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex1 balance : " + getBalance.toString());

	// ex2
	await Evaluator.ex2a_getAnimalToCreateAttributes({from: accounts[0]});
	sex = await Evaluator.readSex(accounts[0])
	legs = await Evaluator.readLegs(accounts[0])
	wings = await Evaluator.readWings(accounts[0])
	name = await Evaluator.readName(accounts[0])
	await ExSol.declareAnimalTo(sex, legs, wings, name, Evaluator.address, {from: accounts[0]})
	animalNumber = await ExSol.getLastAnimalNumber()
	await Evaluator.ex2b_testDeclaredAnimal(animalNumber, {from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex2 balance : " + getBalance.toString());


	// ex3
	await Evaluator.ex3_testRegisterBreeder({from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex3 balance : " + getBalance.toString());

	// ex4
	await Evaluator.ex4_testDeclareAnimal({from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex4 balance : " + getBalance.toString());

	// ex5
	await Evaluator.ex5_declareDeadAnimal({from: accounts[0]});
	// await ExSol.declareAnimalTo(0, 4, false, "gudDoggo", accounts[0], {from: accounts[0]})
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex5 balance : " + getBalance.toString());


	// ex6a
	await Evaluator.ex6a_auctionAnimal_offer({from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex6a balance : " + getBalance.toString());

	// ex6b
	await ExSol.declareAnimalTo(0, 4, false, "gudDoggo", accounts[0], {from: accounts[0]})
	animalNumber = await ExSol.getLastAnimalNumber()
	await ExSol.offerForSale(animalNumber, 10000, {from: accounts[0]})
	await Evaluator.ex6b_auctionAnimal_buy(animalNumber, {from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex6b balance : " + getBalance.toString());



	// ex7a
	await Evaluator2.submitExercice(ExSol.address, {from: accounts[0]});
	await ExSol.declareAnimalTo(0, 4, false, "doggo1", Evaluator2.address, {from: accounts[0]})
	doggo1 = await ExSol.getLastAnimalNumber()
	await ExSol.declareAnimalTo(0, 4, false, "doggo2", Evaluator2.address, {from: accounts[0]})
	doggo2 = await ExSol.getLastAnimalNumber()
	await Evaluator2.ex7a_breedAnimalWithParents(doggo1, doggo2, {from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex7a balance : " + getBalance.toString());

	// ex7b
	await ExSol.declareAnimalTo(0, 4, false, "gudDoggo", accounts[0], {from: accounts[0]})
	await Evaluator2.ex7b_offerAnimalForReproduction({from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex7b balance : " + getBalance.toString());

	// ex7c
	await ExSol.declareAnimalTo(0, 4, false, "gudDoggo", accounts[0], {from: accounts[0]})
	animalNumber = await ExSol.getLastAnimalNumber()
	await ExSol.offerForReproduction(animalNumber, 10000)
	await Evaluator2.ex7c_payForReproduction(animalNumber, {from: accounts[0]});
	getBalance = await TDToken.balanceOf(accounts[0]);
	console.log("Ex7c balance : " + getBalance.toString());
}