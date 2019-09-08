function SetIterator(iterableArmors) {
	this.iterableArmors = iterableArmors;
	this.types = Object.keys(iterableArmors);
	this.len = this.types.length;
	this.armorsArrays = [];
	this.indexes = [];
	this.sizes = [];
	this.hasNextFlag = false;
	this.permutationTotal = 0;
	this.permutation = 0;
	
	var perms = 1;
	for (var i = 0; i < this.len; i++) {
		this.indexes.push(0);
		var type = this.types[i];
		var typeArmors = iterableArmors[type];
		this.armorsArrays[i] = typeArmors;
		var typeArmorTotal = typeArmors.length;
		this.sizes.push(typeArmorTotal);
		if (typeArmorTotal > 0) {
			this.hasNextFlag = true;
			perms = perms * typeArmorTotal;
		}
		this.permutationTotal = perms;
	}
	
	this.hasNext = function() {
		return this.hasNextFlag;
	}
	
	this.next = function() {
		if (!this.hasNextFlag) {
			throw new Error('No next');
		}
		var nextSet = [];
		for (var i = 0; i < this.len; i++) {
			nextSet.push(this.armorsArrays[i][this.indexes[i]]);
		}
		var hasNextNow = false;
		for (var toInc =0; toInc < this.len; toInc++) {
			var inc = this.indexes[toInc] + 1;
			if (inc < this.sizes[toInc]) {
				this.indexes[toInc]++;
				hasNextNow = true;
				break;
			}
			this.indexes[toInc] = 0;
		}
		this.hasNextFlag = hasNextNow;
		this.permutation++;
		return nextSet;
	}
	
	this.getPermutations = function() {
		return this.permutationTotal;
	}
	
	this.getPermutation = function() {
		return this.permutation;
	}
	
	this.print = function() {
		console.log(this);
	};
}