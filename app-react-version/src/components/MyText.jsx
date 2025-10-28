import React from "react";

function MyText(props) {
	if (props.link !== "") {
		return (
			<div>
				<a href={props.link} target={"_blank"} rel="noreferrer" className="MyLink">
					<p className="MyText">{props.text}</p>
				</a>
			</div>
		);
	} else {
		return (
			<div>
				<p className="MyText">{props.text}</p>
			</div>
		);
	}
}

export default MyText;
