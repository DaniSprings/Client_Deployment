import PropTypes from 'prop-types';

const overlayStyle = {
	position: 'fixed',
	inset: 0,
	backgroundColor: 'rgba(0, 0, 0, 0.45)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '1.5rem',
	zIndex: 1000,
};

const modalStyle = {
	width: 'min(640px, 100%)',
	maxHeight: '80vh',
	overflow: 'hidden',
	background: '#fff',
	borderRadius: '16px',
	boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
	display: 'flex',
	flexDirection: 'column',
};

const headerStyle = {
	padding: '1.25rem 1.5rem 0.75rem',
	borderBottom: '1px solid #eee',
};

const contentStyle = {
	padding: '0.5rem 1.5rem 1rem',
	overflowY: 'auto',
};

const listStyle = {
	listStyle: 'none',
	margin: 0,
	padding: 0,
};

const footerStyle = {
	display: 'flex',
	justifyContent: 'flex-end',
	gap: '0.75rem',
	padding: '1rem 1.5rem 1.25rem',
	borderTop: '1px solid #eee',
};

const itemButtonStyle = {
	width: '100%',
	textAlign: 'left',
	padding: '12px',
	border: 0,
	borderBottom: '1px solid #eee',
	background: 'transparent',
	color: '#666',
	cursor: 'pointer',
	transition: 'background-color 0.2s',
};

const itemRowStyle = {
	padding: '12px',
	borderBottom: '1px solid #eee',
	color: '#666',
};

function PopUpModal({
	isOpen,
	title,
	items = [],
	loading = false,
	error = '',
	emptyMessage = 'No items available',
	onClose,
	onBack,
	onItemClick,
	renderItem,
	getItemKey,
}) {
	if (!isOpen) {
		return null;
	}

	const resolvedItems = Array.isArray(items) ? items : [];

	const getDefaultLabel = (item) => {
		if (typeof item === 'string') {
			return item;
		}

		if (item && typeof item === 'object') {
			return item.name || item.label || JSON.stringify(item);
		}

		return String(item ?? '');
	};

	return (
		<div style={overlayStyle} onClick={onClose} role="presentation">
			<div
				style={modalStyle}
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<div style={headerStyle}>
					<h3 style={{ margin: 0 }}>{title}</h3>
				</div>

				<div style={contentStyle}>
					{loading ? (
						<p>Loading items...</p>
					) : error ? (
						<p style={{ color: '#c33', margin: 0 }}>{error}</p>
					) : (
						<ul style={listStyle}>
							{resolvedItems.length > 0 ? (
								resolvedItems.map((item, index) => {
									const key = getItemKey ? getItemKey(item, index) : `${getDefaultLabel(item)}-${index}`;
									const content = renderItem ? renderItem(item, index) : getDefaultLabel(item);

									return (
										<li key={key}>
											{onItemClick ? (
												<button
													type="button"
													style={itemButtonStyle}
													onClick={() => onItemClick(item, index)}
													onMouseEnter={(event) => {
														event.currentTarget.style.backgroundColor = '#f5f5f5';
													}}
													onMouseLeave={(event) => {
														event.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													{content}
												</button>
											) : (
												<div style={itemRowStyle}>{content}</div>
											)}
										</li>
									);
								})
							) : (
								<li style={itemRowStyle}>{emptyMessage}</li>
							)}
						</ul>
					)}
				</div>

				<div style={footerStyle}>
					{onBack ? (
						<button className="rr-btn" onClick={onBack}>Back</button>
					) : null}
					<button className="rr-btn" onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
}

PopUpModal.propTypes = {
	isOpen: PropTypes.bool,
	title: PropTypes.string,
	items: PropTypes.array,
	loading: PropTypes.bool,
	error: PropTypes.string,
	emptyMessage: PropTypes.string,
	onClose: PropTypes.func,
	onBack: PropTypes.func,
	onItemClick: PropTypes.func,
	renderItem: PropTypes.func,
	getItemKey: PropTypes.func,
};

export default PopUpModal;
