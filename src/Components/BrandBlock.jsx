import PropTypes from 'prop-types';

export default function BrandBlock({ brands = [], onBrandClick = () => { } }) {
	const containerStyle = {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
		gap: '16px',
		alignItems: 'start',
		padding: '16px 0'
	};
	const tileStyle = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		padding: '12px',
		borderRadius: '8px',
		background: 'transparent',
		cursor: 'pointer',
		textAlign: 'center'
	};
	const imgStyle = { maxWidth: '100%', maxHeight: '72px', objectFit: 'contain', marginBottom: '8px' };
	const nameStyle = { margin: 0, fontSize: '0.95rem' };

	return (
		<div style={containerStyle}>
			{brands.map((b) => (
				<div
					key={b.key}
					className="brand-block"
					data-brand={b.key}
					style={tileStyle}
					onClick={() => onBrandClick && onBrandClick(b.key)}
				>
					<img src={b.img} alt={b.name} style={imgStyle} />
					<p style={nameStyle}>{b.name}</p>
				</div>
			))}
		</div>
	);
}
