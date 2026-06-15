// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AlphaLens {

    struct Analysis {
        string token;
        uint256 alphaScore;
        uint256 timestamp;
    }

    Analysis[] public analyses;

    function saveAnalysis(
        string memory _token,
        uint256 _score
    ) public {

        analyses.push(
            Analysis(
                _token,
                _score,
                block.timestamp
            )
        );
    }

    function getCount()
        public
        view
        returns(uint256)
    {
        return analyses.length;
    }
}