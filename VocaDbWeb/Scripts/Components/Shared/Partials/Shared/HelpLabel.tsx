import OverlayTrigger from '@/Bootstrap/OverlayTrigger';
import { QTipToolTip } from '@/QTip/QTipToolTip';
import React from 'react';

interface HelpLabelProps {
	label: string;
	title: string;
	forElem?: string;
}

// Displays label element with attached qTip tooltip
export const HelpLabel = ({
	label,
	title,
	forElem,
}: HelpLabelProps): React.ReactElement => {
	return (
		<OverlayTrigger
			placement="bottom-start"
			delay={{ show: 250, hide: 0 }}
			flip
			offset={[0, 8]}
			overlay={<QTipToolTip style={{ opacity: 1 }}>{title}</QTipToolTip>}
		>
			<span>
				<label className="helpTip" htmlFor={forElem ?? ''}>
					{label}
				</label>
			</span>
		</OverlayTrigger>
	);
};
