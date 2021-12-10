pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract ExerciceSolution is ERC721
{
	// breeders
	// address[] breeders;

	mapping(address => bool) public breeders;
	mapping(uint => uint256) public price;
	mapping(uint => uint) public sex;
	mapping(uint => uint) public legs;
	mapping(uint => uint) public parent1;
	mapping(uint => uint) public parent2;
	mapping(uint => bool) public forSale;
	mapping(uint => bool) public wings;
	mapping(uint => bool) public alive;
	mapping(uint => string) public name;
	mapping(uint => bool) public canReproduce;
	mapping(uint => uint256) public reproductionPrice;
	mapping(uint => address) public authorizedBreederToReproduce;

	uint public animalCounter = 2;

	constructor (string memory name_, string memory symbol_, address to_, uint256 tokenid_) public ERC721(name_, symbol_){
		_mint(to_, tokenid_);
	}

	function isBreeder(address account) public returns (bool){
		return breeders[account];
	}

	function registrationPrice() public view returns (uint256){
		return 10000;
	}

	function registerMeAsBreeder() public payable {
		require(msg.value >= registrationPrice(), "Register price is higher than this");
		breeders[msg.sender] = true;
	}

	function declareAnimalTo(uint _sex, uint _legs, bool _wings, string memory _name, address _to) public{
		_mint(_to, animalCounter);
		sex[animalCounter] = _sex;
		legs[animalCounter] = _legs;
		wings[animalCounter] = _wings;
		alive[animalCounter] = true;
		forSale[animalCounter] = false;
		name[animalCounter] = _name;
		authorizedBreederToReproduce[animalCounter] = _to;

		animalCounter += 1;
	}

	function declareAnimal(uint _sex, uint _legs, bool _wings, string memory _name) public returns (uint256){
		_mint(msg.sender, animalCounter);
		sex[animalCounter] = _sex;
		legs[animalCounter] = _legs;
		wings[animalCounter] = _wings;
		alive[animalCounter] = true;
		forSale[animalCounter] = false;
		name[animalCounter] = _name;
		authorizedBreederToReproduce[animalCounter] = msg.sender;

		animalCounter += 1;
		return animalCounter - 1;
	}

	function getLastAnimalNumber() public view returns (uint256){
		return animalCounter - 1;
	}


	// function declareAnimal(uint _sex, uint _legs, bool _wings, string calldata _name) public returns (uint256){
	// 	return declareAnimalTo(_sex, _legs, _wings, _name, msg.sender);
	// }

	function getAnimalCharacteristics(uint animalNumber) public view returns (string memory _name, bool _wings, uint _legs, uint _sex){
		_name = name[animalNumber];
		_wings = wings[animalNumber];
		_legs = legs[animalNumber];
		_sex = sex[animalNumber];
	}

	function declareDeadAnimal(uint animalNumber) public{
		require(msg.sender == ownerOf(animalNumber), "Not your animal");
		alive[animalNumber] = false;
		sex[animalNumber] = 0;
		legs[animalNumber] = 0;
		wings[animalNumber] = false;
		name[animalNumber] = "";
		_burn(animalNumber);
	}

	function isAnimalForSale(uint animalNumber) public view returns (bool){
		return forSale[animalNumber];
	}

	function animalPrice(uint animalNumber) public view returns (uint256){
		return price[animalNumber];
	}

	function buyAnimal(uint animalNumber) public payable{
		require(forSale[animalNumber], "Not for sale");
		require(msg.value >= price[animalNumber], "Price is higher than this");
		forSale[animalNumber] = false;
		price[animalNumber] = 0;
		_transfer(ownerOf(animalNumber), msg.sender, animalNumber);
	}

	function offerForSale(uint animalNumber, uint _price) public{
		forSale[animalNumber] = true;
		price[animalNumber] = _price;
	}


	// Reproduction functions
	function declareAnimalWithParents(uint _sex, uint _legs, bool _wings, string memory _name, uint _parent1, uint _parent2) public returns (uint256){
		require(authorizedBreederToReproduce[_parent1] == msg.sender && authorizedBreederToReproduce[_parent2] == msg.sender, "Sender not autorized for one of the parents");
		_mint(msg.sender, animalCounter);
		sex[animalCounter] = _sex;
		legs[animalCounter] = _legs;
		wings[animalCounter] = _wings;
		alive[animalCounter] = true;
		forSale[animalCounter] = false;
		name[animalCounter] = _name;
		parent1[animalCounter] = _parent1;
		parent2[animalCounter] = _parent2;
		canReproduce[animalCounter] = false;
		reproductionPrice[animalCounter] = 0;
		authorizedBreederToReproduce[animalCounter] = msg.sender;
		authorizedBreederToReproduce[_parent1] = ownerOf(_parent1);
		authorizedBreederToReproduce[_parent2] = ownerOf(_parent2);

		animalCounter += 1;
		return animalCounter - 1;

	}

	// function declareAnimalWithParentsTo(uint _sex, uint _legs, bool _wings, string memory _name, uint _parent1, uint _parent2, address _to) public returns (uint256){
	// 	require(authorizedBreederToReproduce[_parent1] == msg.sender && authorizedBreederToReproduce[_parent2] == msg.sender, "One of the parents is not available to reproduce");
	// 	_mint(_to, animalCounter);
	// 	sex[animalCounter] = _sex;
	// 	legs[animalCounter] = _legs;
	// 	wings[animalCounter] = _wings;
	// 	alive[animalCounter] = true;
	// 	forSale[animalCounter] = false;
	// 	name[animalCounter] = _name;
	// 	parent1[animalCounter] = _parent1;
	// 	parent2[animalCounter] = _parent2;
	// 	canReproduce[animalCounter] = false;
	// 	reproductionPrice[animalCounter] = 0;
	// 	authorizedBreederToReproduce[animalCounter] = msg.sender;
	// 	authorizedBreederToReproduce[_parent1] = ownerOf(_parent1);
	// 	authorizedBreederToReproduce[_parent2] = ownerOf(_parent2);

	// 	animalCounter += 1;
	// 	return animalCounter - 1;

	// }

	function getParents(uint animalNumber) public view returns (uint256 p1, uint256 p2){
		p1 = parent1[animalNumber];
		p2 = parent2[animalNumber];
	}

	function offerForReproduction(uint animalNumber, uint256 priceOfReproduction) public returns (uint256){
		require(msg.sender == ownerOf(animalNumber), "N'est pas owner");
		canReproduce[animalNumber] = true;
		reproductionPrice[animalNumber] = priceOfReproduction;
	}

	function payForReproduction(uint animalNumber) public payable{
		require(canReproduce[animalNumber], "Can't reproduce");
		require(msg.value >= price[animalNumber], "Price is higher than this");
		authorizedBreederToReproduce[animalNumber] = msg.sender; 
		canReproduce[animalNumber] = false;
		reproductionPrice[animalNumber] = 0;
	}
}
