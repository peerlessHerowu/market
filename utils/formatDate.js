function formatDate(time){
	var date = new Date(time);

	var year = date.getFullYear(),
		month = date.getMonth() + 1,//月份是从0开始的
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();
	var newTime = year + '-' +
				month + '-' +
				day + ' ' +
				hour + ':' +
				min + ':' +
				sec;
	return newTime;			
}

module.exports = {
    formatDate:formatDate
}