function getWeightDelta(data) {
    // Get weight from most recent record
    var weightCurrent = data[Object.keys(data).length - 1].weight;
    // Get weight from the record in the middle of the array (measured approximately 24 hours ago)
    // This is done in case there is no record from *exactly* 24 hours ago
    var weightStartIndex = Math.floor(((Object.keys(data).length - 1) / 2))
    var weightStart = data[weightStartIndex].weight;
    // Calculate the delta of the current and start weight
    var weightDelta = weightCurrent - weightStart;
    // Limit float to 2 decimal places
    weightDelta = Number(weightDelta.toFixed(2));
    // Format HTML string with green color for weight growth and red color for weight decline
    var weightDeltaString = weightDelta >= 0 ? `<p style="color: #8aff6b;">+${weightDelta}</p>` : `<p style="color: #fe7373;">${weightDelta}</p>`;
    
    return weightDeltaString;
}